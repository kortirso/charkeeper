# frozen_string_literal: true

describe WebhooksContext::HandleTelegramMessageWebhookService do
  subject(:service_call) { described_class.new.call(message: message) }

  let(:message) do
    {
      from: { first_name: 'First', last_name: 'Last', username: 'User', language_code: 'en' },
      chat: { id: 1 },
      text: text
    }
  end
  let(:client) { Charkeeper::Container.resolve('api.telegram.client') }

  before do
    allow(client).to receive(:send_message)
  end

  context 'for existing bot command' do
    let(:text) { '/start' }

    it 'sends response message', :aggregate_failures do
      expect { service_call }.to change(User, :count).by(1)
      expect(client).to have_received(:send_message)
    end

    context 'for existing deleted user' do
      let!(:user) { create :user, discarded_at: DateTime.now }
      let!(:identity) { create :user_identity, user: user, uid: '1', provider: 'telegram', active: false }

      it 'restores user', :aggregate_failures do
        expect { service_call }.not_to change(User, :count)
        expect(client).to have_received(:send_message)
        expect(user.reload.discarded_at).to be_nil
        expect(identity.reload.active).to be_truthy
      end
    end
  end

  context 'for unexisting message' do
    let(:text) { 'unexisting' }

    it 'sends response message' do
      service_call

      expect(client).to have_received(:send_message)
    end
  end
end
