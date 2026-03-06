# frozen_string_literal: true

module BotContextV2
  module Commands
    module Checks
      class Fallout
        include Deps[roll_command: 'services.bot_context_v2.commands.rolls.default']

        def call(arguments: [])
          type = arguments.shift
          target = arguments.shift
          result =
            case type
            when 'skill' then check(arguments)
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
            rolls: values[..-3],
            successes: values[-2],
            complications: values[-1]
          }
        end

        def rolls(arguments)
          values = BotContextV2::Commands::Parsers::MakeCheck.new.call(arguments: arguments) # { bonus: 1 }

          rolls = []
          successes = 0
          complications = 0

          (2 + values[:bonus].to_i).times do
            roll_result = roll_command.call(arguments: ['d20'])[:result]
            rolls << roll_result
            successes, complications =
              check_roll_result(roll_result[:total], values[:target], values[:expertise], successes, complications)
          end

          [rolls, successes, complications].flatten
        end

        def check_roll_result(roll_result, target, expertise, successes, complications)
          complications += 1 if roll_result == 20
          successes += 2 if roll_result <= expertise
          successes += 1 if roll_result > expertise && roll_result <= target

          [successes, complications]
        end
      end
    end
  end
end
