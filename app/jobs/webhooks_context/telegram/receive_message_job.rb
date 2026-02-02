# frozen_string_literal: true

module WebhooksContext
  module Telegram
    class ReceiveMessageJob < ApplicationJob
      queue_as :default

      def perform(message:)
        message_webhook.call({ message: message })
      end

      private

      def message_webhook
        Charkeeper::Container.resolve('commands.webhooks_context.telegram.receive_message_webhook')
      end
    end
  end
end
