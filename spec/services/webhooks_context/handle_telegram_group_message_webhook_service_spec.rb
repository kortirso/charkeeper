# frozen_string_literal: true

describe WebhooksContext::HandleTelegramGroupMessageWebhookService do
  subject(:service_call) { described_class.new.call(message: message) }

  let(:message) do
    {
      message_id: 1,
      from: { language_code: 'en' },
      chat: { id: 1 },
      text: text
    }
  end
  let(:client) { Charkeeper::Container.resolve('api.telegram.client') }

  before do
    allow(client).to receive(:send_message)
  end

  context 'for existing bot command' do
    let(:text) { '/roll d20' }

    it 'sends response message' do
      service_call

      expect(client).to have_received(:send_message)
    end
  end
end
