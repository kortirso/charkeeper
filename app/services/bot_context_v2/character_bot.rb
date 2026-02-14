# frozen_string_literal: true

module BotContextV2
  class CharacterBot
    include Deps[
      handle_command: 'services.bot_context_v2.handle_command',
      represent_character_command: 'services.bot_context_v2.represent_character_bot'
    ]

    ALLOWED_COMMANDS = %w[/check /roll /dualityRoll /fateRoll].freeze
    PROVIDER_BASED_COMMANDS = %w[/check].freeze

    def call(messages:, character:)
      messages.map do |message|
        command, arguments = parse_command_text(message)
        next { errors: ['Invalid command'] } if ALLOWED_COMMANDS.exclude?(command)

        command_result = handle_command.call(command: command, arguments: arguments, character: character)
        next { errors: ['Invalid command'] } if command_result.nil?
        next { errors: command_result[:errors] } if command_result[:errors].present?

        send_message_to_channels(command, command_result, character)

        { result: command_result[:result] }
      rescue ActiveRecord::RecordNotFound => _e
        { errors: [I18n.t('not_found')], errors_list: [I18n.t('not_found')] }
      rescue ArgumentError, OptionParser::MissingArgument => _e
        { errors: ['Invalid command'], errors_list: ['Invalid command'] }
      end
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

    def send_message_to_channels(command, command_result, character)
      command_result[:character] = character
      character.channels.each do |channel|
        formatted_result =
          represent_character_command.call(
            command: command,
            provider: PROVIDER_BASED_COMMANDS.include?(command) ? character_provider(character.class.name) : nil,
            command_result: command_result
          )

        send_result_message(channel.external_id, formatted_result)
      end
    end

    def send_result_message(external_id, formatted_result)
      BotContext::Channels::SendToTelegramJob.perform_later(
        external_id,
        formatted_result[:errors] ? formatted_result.dig(:errors, 0) : formatted_result[:result]
      )
    end

    def character_provider(name)
      case name
      when 'Dnd5::Character', 'Dnd2024::Character', 'Dc20::Character', 'Pathfinder2::Character' then 'dnd'
      when 'Daggerheart::Character' then 'daggerheart'
      when 'Fate::Character' then 'fate'
      end
    end
  end
end
