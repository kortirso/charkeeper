# frozen_string_literal: true

module BotContext
  class HandleService
    include Deps[
      telegram_api: 'api.telegram.client',
      handle_command: 'services.bot_context.handle_command',
      represent_command: 'services.bot_context.represent_command',
      represent_raw_command: 'services.bot_context.represent_raw_command',
      handle_webhook: 'services.webhooks_context.telegram.handle_message_webhook'
    ]

    SERVICE_COMMANDS = %w[/start /contacts /unsubscribe /subscribe /help /commands].freeze
    SERVICE_SOURCES = %i[telegram_bot].freeze
    TELEGRAM_SOURCES = %i[telegram_bot telegram_group_bot].freeze
    RESPONSE_SOURCES = %i[web raw].freeze

    # rubocop: disable Metrics/AbcSize
    def call(source:, message:, data: {})
      command, arguments = parse_command_text(message)
      if SERVICE_COMMANDS.include?(command)
        handle_webhook.call(message: data[:raw_message]) if SERVICE_SOURCES.include?(source)
        return { result: :ok }
      end

      command_result = handle_command.call(source: source, command: command, arguments: arguments, data: data)
      return response(source, { errors: ['Invalid command'] }, data) if command_result.nil?
      return response(source, { errors: command_result[:errors] }, data) if command_result[:errors].present?

      command_formatted_result = represent_command.call(source: source, command: command, command_result: command_result)
      return if command_formatted_result.nil?

      response(source, command_formatted_result, data)
    rescue ActiveRecord::RecordNotFound => _e
      { errors: [I18n.t('not_found')], errors_list: [I18n.t('not_found')] }
    rescue ArgumentError, OptionParser::MissingArgument => _e
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
      send_result_message_in_response(data[:raw_message], result) if source.in?(TELEGRAM_SOURCES)
      send_messages_to_channels(result, data) if source == :raw && data[:character]
      { result: result[:result], errors: result[:errors], errors_list: result[:errors] } if source.in?(RESPONSE_SOURCES)
    end

    def send_messages_to_channels(result, data)
      command_result = result.merge(character: data[:character])
      data[:character].channels.find_each do |channel|
        command_formatted_result =
          represent_raw_command.call(
            source: channel.provider.to_sym,
            command: '/check',
            provider: character_provider(data[:character].class.name),
            command_result: command_result
          )
        send_result_message(channel.external_id, command_formatted_result)
      end
    end

    def send_result_message_in_response(raw_message, command_formatted_result)
      telegram_api.send_message(
        bot_secret: bot_secret,
        chat_id: raw_message.dig(:chat, :id),
        reply_to_message_id: raw_message[:message_id],
        text: command_formatted_result[:errors] ? command_formatted_result.dig(:errors, 0) : command_formatted_result[:result]
      )
    end

    def send_result_message(external_id, command_formatted_result)
      telegram_api.send_message(
        bot_secret: bot_secret,
        chat_id: external_id,
        text: command_formatted_result[:errors] ? command_formatted_result.dig(:errors, 0) : command_formatted_result[:result]
      )
    end

    def character_provider(name)
      case name
      when 'Dnd5::Character', 'Dnd2024::Character', 'Dc20::Character', 'Pathfinder2::Character' then 'dnd'
      when 'Daggerheart::Character' then 'daggerheart'
      end
    end

    def bot_secret
      @bot_secret ||= Rails.application.credentials.dig(Rails.env.to_sym, :web_telegram_bot_token)
    end
  end
end
