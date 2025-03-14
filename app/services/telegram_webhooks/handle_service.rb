# frozen_string_literal: true

module TelegramWebhooks
  class HandleService
    include Deps[telegram_api: 'api.telegram.client']

    def call(message:)
      define_locale(message)
      process_message(message)
    end

    private

    def define_locale(message)
      message_locale = message.dig(:from, :language_code).to_sym
      I18n.locale = I18n.available_locales.include?(message_locale) ? message_locale : I18n.default_locale
    end

    def process_message(message)
      case message[:text]
      when '/start' then send_start_message(message[:from], message[:chat])
      else send_unknown_message(message[:chat])
      end
    end

    def send_start_message(sender, chat)
      telegram_api.send_message(
        bot_secret: bot_secret,
        chat_id: chat[:id],
        text: I18n.t('telegram_webhook.start', sender: sender[:username])
      )
    end

    def send_unknown_message(chat)
      telegram_api.send_message(
        bot_secret: bot_secret,
        chat_id: chat[:id],
        text: I18n.t('telegram_webhook.unknown')
      )
    end

    def bot_secret
      @bot_secret ||= Rails.application.credentials.dig(Rails.env.to_sym, :web_telegram_bot_token)
    end
  end
end
