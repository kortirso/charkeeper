# frozen_string_literal: true

module BotContext
  class HandleService
    include Deps[
      monitoring: 'monitoring.client',
      telegram_api: 'api.telegram.client',
      handle_command: 'services.bot_context.handle_command',
      represent_command: 'services.bot_context.represent_command',
      handle_webhook: 'services.webhooks_context.telegram.handle_message_webhook'
    ]

    SERVICE_COMMANDS = %w[/start /contacts /unsubscribe /subscribe /help /commands].freeze
    SERVICE_SOURCES = %i[telegram_bot].freeze

    # rubocop: disable Metrics/AbcSize
    def call(source:, message:, data: {})
      command, arguments = parse_command_text(message)
      if SERVICE_COMMANDS.include?(command)
        handle_webhook.call(message: data[:raw_message]) if SERVICE_SOURCES.include?(source)
        return { result: :ok }
      end

      command_result = handle_command.call(source: source, command: command, arguments: arguments, data: data)
      monitoring_command_result(source, message, command_result, data[:raw_message])
      return response(source, { errors: ['Invalid command'] }, data) if command_result.nil?
      return response(source, { errors: command_result[:errors] }, data) if command_result[:errors].present?

      command_formatted_result = represent_command.call(source: source, command: command, command_result: command_result)
      return if command_formatted_result.nil?

      response(source, command_formatted_result, data)
    rescue ActiveRecord::RecordNotFound => _e
      { errors: [I18n.t('not_found')], errors_list: [I18n.t('not_found')] }
    rescue ArgumentError => _e
      { errors: ['Invalid command'], errors_list: ['Invalid command'] }
    end
    # rubocop: enable Metrics/AbcSize

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

    def response(source, result, data={})
      return send_result_message(data[:raw_message], result) if source != :web

      { result: result[:result], errors: result[:errors], errors_list: result[:errors] }
    end

    def send_result_message(raw_message, command_formatted_result)
      telegram_api.send_message(
        bot_secret: bot_secret,
        chat_id: raw_message.dig(:chat, :id),
        reply_to_message_id: raw_message[:message_id],
        text: command_formatted_result[:errors] ? command_formatted_result.dig(:errors, 0) : command_formatted_result[:result]
      )
    end

    def monitoring_command_result(source, message, result, raw_message)
      monitoring.notify(
        exception: Monitoring::HandleTelegramWebhook.new('Handle telegram webhook'),
        metadata: { source: source, message: message, result: result, raw_message: raw_message },
        severity: :info
      )
    end

    def bot_secret
      @bot_secret ||= Rails.application.credentials.dig(Rails.env.to_sym, :web_telegram_bot_token)
    end
  end
end
