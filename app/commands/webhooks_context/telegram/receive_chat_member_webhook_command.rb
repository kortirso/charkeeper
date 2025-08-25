# frozen_string_literal: true

module WebhooksContext
  module Telegram
    class ReceiveChatMemberWebhookCommand < BaseCommand
      include Deps[
        handle_webhook: 'services.webhooks_context.telegram.handle_chat_member_webhook'
      ]

      use_contract do
        params do
          required(:chat_member).hash do
            required(:chat).hash do
              required(:id).filled(:integer)
            end
            required(:new_chat_member).hash do
              required(:status).filled(:string) # member/kicked
            end
          end
        end
      end

      private

      def do_persist(input)
        handle_webhook.call(chat_member: input[:chat_member]) if input.dig(:chat_member, :chat, :id).positive?

        { result: :ok }
      end
    end
  end
end
