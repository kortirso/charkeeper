# frozen_string_literal: true

describe WebhooksContext::ReceiveTelegramChatMemberWebhookCommand do
  subject(:command_call) { described_class.new.call({ chat_member: chat_member }) }

  let(:handler) { Charkeeper::Container.resolve('services.webhooks_context.handle_telegram_chat_member_webhook') }

  before { allow(handler).to receive(:call) }

  context 'with invalid message' do
    let(:chat_member) do
      {
        from: { first_name: 'First', last_name: 'Last', username: 'User', language_code: 'en' },
        chat: { id: '' },
        new_chat_member: { status: 'kicked' }
      }
    end

    it 'does not call handler' do
      command_call

      expect(handler).not_to have_received(:call)
    end
  end

  context 'with valid message' do
    let(:chat_member) do
      {
        from: { first_name: 'First', last_name: 'Last', username: 'User', language_code: 'en' },
        chat: { id: 1 },
        new_chat_member: { status: 'kicked' }
      }
    end

    it 'calls handler' do
      command_call

      expect(handler).to have_received(:call).with(chat_member: chat_member)
    end
  end
end
