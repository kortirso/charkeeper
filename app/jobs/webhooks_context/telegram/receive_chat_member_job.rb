# frozen_string_literal: true

module WebhooksContext
  module Telegram
    class ReceiveChatMemberJob < ApplicationJob
      queue_as :default

      def perform(message:)
        chat_member_webhook.call({ chat_member: message })
      end

      private

      def chat_member_webhook
        Charkeeper::Container.resolve('commands.webhooks_context.telegram.receive_chat_member_webhook')
      end
    end
  end
end
