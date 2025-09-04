# frozen_string_literal: true

module WebhooksContext
  module Telegram
    class ReceiveMessageWebhookCommand < BaseCommand
      include Deps[
        handle_webhook: 'services.webhooks_context.telegram.handle_message_webhook',
        handle_group_webhook: 'services.webhooks_context.telegram.handle_group_message_webhook'
      ]

      use_contract do
        params do
          required(:message).hash do
            required(:message_id).filled(:integer)
            required(:from).hash do
              optional(:id).filled(:integer)
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
        handle_webhook.call(message: input[:message]) if input.dig(:message, :chat, :id).positive?
        handle_group_webhook.call(message: input[:message]) if input.dig(:message, :chat, :id).negative?


        # BotService.call({
        #   source: 'telegram',
        #   message: input[:message][:text],
        #   data: { user: current_user }
        # })

        { result: :ok }
      end
    end
  end
end
