# frozen_string_literal: true

module WebhooksContext
  class HandleTelegramGroupMessageWebhookService
    include Deps[
      telegram_api: 'api.telegram.client',
      handle_bot_command: 'services.webhooks_context.handle_bot_command'
    ]

    def call(message:)
      define_locale(message)
      command, arguments = parse_message(message[:text])
      text = handle_bot_command.call(command: command, arguments: arguments)
      send_result_message(message, text) if text.present?
    end

    private

    def define_locale(message)
      message_locale = message.dig(:from, :language_code).to_sym
      I18n.locale = I18n.available_locales.include?(message_locale) ? message_locale : I18n.default_locale
    end

    def parse_message(message)
      result = split_preserving_quotes(message)
      [result.shift, result]
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

    # rubocop: disable Style/RedundantRegexpArgument
    def split_preserving_quotes(str)
      str.scan(/(?:\"(?:\\\"|[^\"])*\"|\'(?:\\\'|[^\'])*\'|[^\s"]+)/).map do |match|
        # Remove surrounding quotes if present and unescape internal quotes
        if match.start_with?('"') && match.end_with?('"')
          match[1..-2].gsub(/\\"/, '"')
        elsif match.start_with?('\'') && match.end_with?('\'')
          match[1..-2].gsub(/\\'/, '\'')
        else
          match
        end
      end
    end
    # rubocop: enable Style/RedundantRegexpArgument
  end
end
