# frozen_string_literal: true

module BotContext
  module Commands
    module Checks
      class Fate
        include Deps[roll_command: 'rolls.fate']

        def call(character:, arguments: [])
          type = arguments.shift
          target = arguments.shift
          result =
            case type
            when 'skill' then check(character, target, arguments)
            end

          {
            type: type,
            target: target,
            result: result,
            errors: nil
          }
        end

        private

        def check(_character, _target, arguments)
          values = rolls(arguments)
          {
            rolls: values[..-2],
            total: values[-1]
          }
        end

        def rolls(arguments)
          values = BotContext::Commands::Parsers::MakeCheck.new.call(arguments: arguments) # { bonus: 1 }

          first_check = roll_command.call
          second_check = roll_command.call
          third_check = roll_command.call
          forth_check = roll_command.call

          total = first_check + second_check + third_check + forth_check + values[:bonus].to_i

          [first_check, second_check, third_check, forth_check, total]
        end
      end
    end
  end
end
