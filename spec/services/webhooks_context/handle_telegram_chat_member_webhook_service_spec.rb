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

      it 'updates identity' do
        service_call

        expect(identity.reload.active).to be_falsy
      end
    end

    context 'for member status' do
      let(:status) { 'member' }

      it 'does not update identity' do
        service_call

        expect(identity.reload.active).to be_truthy
      end
    end
  end
end
