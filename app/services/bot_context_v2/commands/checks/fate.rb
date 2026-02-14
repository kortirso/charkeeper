# frozen_string_literal: true

module BotContextV2
  module Commands
    module Checks
      class Fate
        include Deps[roll_command: 'rolls.fate']

        def call(arguments: [])
          type = arguments.shift
          target = arguments.shift
          result =
            case type
            when 'skill', 'stunt' then check(arguments)
            end

          {
            type: type,
            target: target,
            result: result,
            errors: nil
          }
        end

        private

        def check(arguments)
          values = rolls(arguments)
          {
            rolls: values[..-2],
            total: values[-1]
          }
        end

        def rolls(arguments)
          values = BotContextV2::Commands::Parsers::MakeCheck.new.call(arguments: arguments) # { bonus: 1 }

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
