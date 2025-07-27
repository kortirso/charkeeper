# frozen_string_literal: true

describe WebhooksContext::HandleTelegramChatMemberWebhookService do
  subject(:service_call) { described_class.new.call(chat_member: chat_member) }

  let(:chat_member) do
    {
      chat: { id: 1 },
      new_chat_member: { status: status }
    }
  end

  context 'for unexisting identity' do
    let(:status) { 'kicked' }

    it 'does not raise errors' do
      expect { service_call }.not_to raise_error
    end
  end

  context 'for existing identity' do
    let!(:identity) { create :user_identity, active: true, uid: '1', provider: 'telegram' }

    context 'for kicked status' do
      let(:status) { 'kicked' }

      it 'updates identity', :aggregate_failures do
        service_call

        expect(identity.reload.active).to be_falsy
        expect(identity.user.reload.discarded_at).not_to be_nil
      end
    end

    context 'for member status' do
      let(:status) { 'member' }

      it 'does not update identity', :aggregate_failures do
        service_call

        expect(identity.reload.active).to be_truthy
        expect(identity.user.reload.discarded_at).to be_nil
      end
    end
  end
end
