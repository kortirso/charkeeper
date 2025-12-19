# frozen_string_literal: true

module BotContext
  module Commands
    module Checks
      class Dnd
        include Deps[roll_command: 'services.bot_context.commands.roll']

        def call(character:, arguments: [])
          type = arguments.shift
          target = arguments.shift
          result =
            case type
            when 'save', 'attr', 'skill', 'attack', 'initiative' then save_check(character, target, arguments)
            end

          {
            type: type,
            target: target,
            result: result,
            errors: nil
          }
        end

        private

        def save_check(_character, _target, arguments)
          values = rolls(arguments)
          {
            rolls: [values.dig(0, :rolls, 0), values&.dig(1, :rolls, 0)].compact,
            total: values[-1],
            final_roll: values[-2],
            status: status(values[-2])
          }
        end

        def rolls(arguments) # rubocop: disable Metrics/AbcSize
          values = BotContext::Commands::Parsers::MakeCheck.new.call(arguments: arguments) # { adv: 1, bonus: 1 }

          main_check = roll_command.call(arguments: ['d20'])[:result]
          adv_check = roll_command.call(arguments: ['d20'])[:result] unless values[:adv].to_i.zero?

          totals = [main_check[:total], adv_check&.dig(:total)].compact
          final_roll = values[:adv].to_i.positive? ? totals.max : totals.min

          [
            main_check,
            adv_check,
            final_roll,
            final_roll + values[:bonus].to_i
          ]
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
