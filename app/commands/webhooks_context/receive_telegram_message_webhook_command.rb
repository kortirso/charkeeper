# frozen_string_literal: true

module WebhooksContext
  class ReceiveTelegramMessageWebhookCommand < BaseCommand
    include Deps[
      handle_telegram_webhook: 'services.webhooks_context.handle_telegram_message_webhook'
    ]

    use_contract do
      params do
        required(:message).hash do
          required(:from).hash do
            optional(:first_name).filled(:string)
            optional(:last_name).filled(:string)
            optional(:username).filled(:string)
            optional(:language_code).filled(:string)
          end
          required(:chat).hash do
            required(:id).filled(:integer)
          end
          required(:text).filled(:string)
        end
      end
    end

    private

    def do_persist(input)
      handle_telegram_webhook.call(message: input[:message])

      { result: :ok }
    end
  end
end
