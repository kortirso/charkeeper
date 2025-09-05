# frozen_string_literal: true

module BotContext
  class HandleService
    include Deps[
      telegram_api: 'api.telegram.client',
      handle_command: 'services.bot_context.handle_command',
      represent_command: 'services.bot_context.represent_command',
      handle_webhook: 'services.webhooks_context.telegram.handle_message_webhook'
    ]

    SERVICE_COMMANDS = %w[/start /contacts /unsubscribe /subscribe].freeze
    SERVICE_SOURCES = %i[telegram_bot].freeze

    def call(source:, message:, data: {})
      command, arguments = parse_command_text(message)
      return handle_webhook.call(message: data[:raw_message]) if SERVICE_COMMANDS.include?(command)
      return if SERVICE_SOURCES.include?(source)

      command_result = handle_command.call(command: command, arguments: arguments)
      return if command_result.nil?

      text = represent_command.call(source: source, command: command, command_result: command_result)
      return if text.nil?
      return text if source == :web

      send_result_message(data[:raw_message], text)
    end

    private

    # rubocop: disable Style/RedundantRegexpArgument
    def parse_command_text(str)
      result = str.scan(/(?:\"(?:\\\"|[^\"])*\"|\'(?:\\\'|[^\'])*\'|[^\s"]+)/).map do |match|
        # Remove surrounding quotes if present and unescape internal quotes
        if match.start_with?('"') && match.end_with?('"')
          match[1..-2].gsub(/\\"/, '"')
        elsif match.start_with?('\'') && match.end_with?('\'')
          match[1..-2].gsub(/\\'/, '\'')
        else
          match
        end
      end
      [result.shift, result]
    end
    # rubocop: enable Style/RedundantRegexpArgument

    def send_result_message(raw_message, text)
      telegram_api.send_message(
        bot_secret: bot_secret,
        chat_id: raw_message.dig(:chat, :id),
        reply_to_message_id: raw_message[:message_id],
        text: text
      )
    end

    def bot_secret
      @bot_secret ||= Rails.application.credentials.dig(Rails.env.to_sym, :web_telegram_bot_token)
    end
  end
end
