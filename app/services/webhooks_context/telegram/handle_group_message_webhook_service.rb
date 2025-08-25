# frozen_string_literal: true

module WebhooksContext
  module Telegram
    class HandleGroupMessageWebhookService
      include Deps[
        telegram_api: 'api.telegram.client',
        handle_bot_command: 'services.webhooks_context.telegram.handle_bot_command'
      ]

      def call(message:)
        define_locale(message)
        text = handle_bot_command.call(command_text: message[:text])
        send_result_message(message, text) if text.present?
      end

      private

      def define_locale(message)
        message_locale = message.dig(:from, :language_code).to_sym
        I18n.locale = I18n.available_locales.include?(message_locale) ? message_locale : I18n.default_locale
      end

      def send_result_message(message, text)
        telegram_api.send_message(
          bot_secret: bot_secret,
          chat_id: message.dig(:chat, :id),
          reply_to_message_id: message[:message_id],
          text: text
        )
      end

      def bot_secret
        @bot_secret ||= Rails.application.credentials.dig(Rails.env.to_sym, :web_telegram_bot_token)
      end
    end
  end
end
