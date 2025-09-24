# frozen_string_literal: true

describe WebhooksContext::Telegram::ReceiveMessageWebhookCommand do
  subject(:command_call) { described_class.new.call({ message: message }) }

  let(:handler) { BotContext::HandleJob }

  before do
    allow(handler).to receive(:perform_later)
  end

  context 'with invalid message' do
    let(:message) do
      {
        message_id: 1,
        from: { first_name: 'First', last_name: 'Last', username: 'User', language_code: 'en' },
        chat: { id: '' },
        text: 'text'
      }
    end

    it 'does not call handler' do
      command_call

      expect(handler).not_to have_received(:perform_later)
    end
  end

  context 'with valid group message' do
    let(:message) do
      {
        message_id: 1,
        from: { first_name: 'First', last_name: 'Last', username: 'User', language_code: 'en' },
        chat: { id: -123 },
        text: '/roll d20'
      }
    end

    it 'calls group_handler' do
      command_call

      expect(handler).to have_received(:perform_later)
    end
  end

  context 'with not command message' do
    let(:message) do
      {
        message_id: 1,
        from: { first_name: 'First', last_name: 'Last', username: 'User', language_code: 'en' },
        chat: { id: 123 },
        text: 'text'
      }
    end

    it 'does not call handler' do
      command_call

      expect(handler).not_to have_received(:perform_later)
    end
  end

  context 'with valid message' do
    let(:message) do
      {
        message_id: 1,
        from: { first_name: 'First', last_name: 'Last', username: 'User', language_code: 'en' },
        chat: { id: 123 },
        text: '/text'
      }
    end

    it 'calls handler' do
      command_call

      expect(handler).to have_received(:perform_later)
    end
  end
end
