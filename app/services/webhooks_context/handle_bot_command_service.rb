# frozen_string_literal: true

module WebhooksContext
  class HandleBotCommandService
    include Deps[roll: 'roll']

    def call(command_text:)
      command, arguments = parse_command_text(command_text)
      case command
      when '/roll' then represent_roll_command_result(handle_roll_command(arguments))
      else 'Unknown command'
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

    def handle_roll_command(arguments)
      total = 0
      rolls = arguments.map do |argument|
        dice, modifier = argument.gsub(/\s+/, '').split('+')
        roll_result = roll.call(dice: dice, modifier: modifier.to_i)
        total += roll_result
        [argument, roll_result]
      end
      { rolls: rolls, total: total }
    end
  end
end
