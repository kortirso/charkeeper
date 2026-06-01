# frozen_string_literal: true

module BotContextV2
  module Commands
    module Checks
      class Cthulhu7
        include Deps[roll_command: 'services.bot_context_v2.commands.rolls.default']

        def call(arguments: [])
          type = arguments.shift
          target = arguments.shift
          result =
            case type
            when 'attr', 'skill' then attr_check(arguments)
            end

          {
            type: type,
            target: target,
            result: result,
            errors: nil
          }
        end

        private

        def attr_check(arguments)
          values = rolls(arguments)
          {
            rolls: [
              values.dig(0, :rolls, 0), values.dig(1, :rolls, 0), values&.dig(2, :rolls, 0), values&.dig(3, :rolls, 0)
            ].compact,
            total: values[4],
            status: values[5]
          }
        end

        def rolls(arguments) # rubocop: disable Metrics/AbcSize
          values = BotContextV2::Commands::Parsers::MakeCheck.new.call(arguments: arguments) # { adv: 2, dc: 50 }

          main_check = roll_command.call(arguments: ['d10'])[:result]
          secondary_check = roll_command.call(arguments: ['d10'])[:result]
          adv1_check = roll_command.call(arguments: ['d10'])[:result] if values[:adv].to_i.abs >= 1
          adv2_check = roll_command.call(arguments: ['d10'])[:result] if values[:adv].to_i.abs == 2

          totals =
            [
              value(main_check[:total], secondary_check[:total]),
              value(adv1_check&.dig(:total), secondary_check[:total]),
              value(adv2_check&.dig(:total), secondary_check[:total])
            ].compact
          total = values[:adv].to_i.positive? ? totals.min : totals.max

          [main_check, secondary_check, adv1_check, adv2_check, total, status(total, values[:dc])]
        end

        def value(main, secondary)
          return unless main

          main = 0 if main == 10
          secondary = 0 if secondary == 10
          return 100 if main.zero? && secondary.zero?

          (main * 10) + secondary
        end

        def status(total, target) # rubocop: disable Metrics/PerceivedComplexity
          return unless target
          return :fumble if (target < 50 && total >= 96) || (target >= 50 && total == 100)
          return :crit if total == 1
          return :extreme_success if total <= target / 5
          return :hard_success if total <= target / 2
          return :regular_success if total <= target

          :failure
        end
      end
    end
  end
end
