# frozen_string_literal: true

module BotContext
  module Commands
    module Checks
      class Dc20
        include Deps[roll_command: 'services.bot_context.commands.roll']

        def call(character:, arguments: [])
          type = arguments.shift
          target = arguments.shift
          result =
            case type
            when 'attr', 'save', 'skill', 'trade', 'language', 'initiative', 'attack'
              attr_check(character, target, arguments)
            end

          {
            type: type,
            target: target,
            result: result,
            errors: nil
          }
        end

        private

        def attr_check(_character, _target, arguments)
          values = rolls(arguments)
          {
            rolls: values[0..-3].map { |i| i.dig(:rolls, 0) },
            total: values[-1],
            final_roll: values[-2],
            status: status(values[-2])
          }
        end

        def rolls(arguments) # rubocop: disable Metrics/AbcSize
          values = BotContext::Commands::Parsers::MakeCheck.new.call(arguments: arguments) # { adv: 1, bonus: 1 }
          main_check = roll_command.call(arguments: ['d20'])[:result]
          unless values[:adv].to_i.zero?
            adv_checks = (1..values[:adv].abs).map { roll_command.call(arguments: ['d20'])[:result] }
          end

          totals = [main_check[:total], adv_checks&.pluck(:total)].compact.flatten
          final_roll = values[:adv].to_i.positive? ? totals.max : totals.min

          [
            main_check,
            adv_checks,
            final_roll,
            final_roll + values[:bonus].to_i
          ].compact.flatten
        end

        def status(value)
          return :crit_success if value == 20
          return :crit_failure if value == 1

          :success
        end
      end
    end
  end
end
