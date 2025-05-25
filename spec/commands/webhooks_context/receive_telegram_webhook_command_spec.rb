# frozen_string_literal: true

describe WebhooksContext::ReceiveTelegramWebhookCommand do
  subject(:command_call) { described_class.new.call({ message: message }) }

  let(:handler) { Charkeeper::Container.resolve('services.webhooks_context.handle_telegram_webhook') }

  before { allow(handler).to receive(:call) }

  context 'with invalid message' do
    let(:message) do
      {
        from: { first_name: 'First', last_name: 'Last', username: 'User', language_code: 'en' },
        chat: { id: '' },
        text: 'text'
      }
    end

    it 'does not call handler' do
      command_call

      expect(handler).not_to have_received(:call)
    end
  end

  context 'with valid message' do
    let(:message) do
      {
        from: { first_name: 'First', last_name: 'Last', username: 'User', language_code: 'en' },
        chat: { id: 123 },
        text: 'text'
      }
    end

    it 'calls handler' do
      command_call

      expect(handler).to have_received(:call).with(message: message)
    end
  end
end
