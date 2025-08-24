# frozen_string_literal: true

module WebhooksContext
  class HandleBotCommandService
    include Deps[roll: 'roll']

    def call(command:, arguments: [])
      case command
      when '/roll' then handle_roll_command(arguments)
      else ''
      end
    end

    private

    def handle_roll_command(arguments)
      total = 0
      result = arguments.map do |argument|
        dice, modifier = argument.split('+')
        roll_result = roll.call(dice: dice, modifier: modifier.to_i)
        total += roll_result
        "#{argument} (#{roll_result})"
      end.join(', ') # rubocop: disable Style/MethodCalledOnDoEndBlock
      "Result: #{result}\nTotal: #{total}"
    end
  end
end
