# frozen_string_literal: true

module BotContextV2
  module Commands
    module Checks
      class Pf2Attack
        include Deps[roll_command: 'services.bot_context_v2.commands.rolls.default']

        def call(arguments: [])
          {
            type: 'attack',
            target: 'attack',
            result: attr_check(arguments),
            errors: nil
          }
        end

        private

        def attr_check(arguments)
          values = rolls(arguments)
          {
            rolls: [values.dig(0, :rolls, 0), values&.dig(1, :rolls, 0)].compact,
            total: values[3],
            final_roll: values[2],
            status: status(values[2]),
            damage: values[4],
            crit_damage: values[5],
            damage_rolls: values[6],
            crit_rolls: values[7],
            damage_bonus: values[8],
            crit_damage_bonus: values[9]
          }
        end

        def rolls(arguments) # rubocop: disable Metrics/AbcSize, Metrics/MethodLength, Metrics/PerceivedComplexity
          values = BotContextV2::Commands::Parsers::MakeCheck.new.call(arguments: arguments) # { adv: 1, bonus: 1 }

          main_check = roll_command.call(arguments: ['d20'])[:result]
          adv_check = roll_command.call(arguments: ['d20'])[:result] unless values[:adv].to_i.zero?

          totals = [main_check[:total], adv_check&.dig(:total)].compact
          final_roll = values[:adv].to_i.positive? ? totals.max : totals.min

          damage_rolls = []
          crit_rolls = []

          values[:dices].each do |dice|
            crit_dice = values[:fatal] || dice

            value = roll_command.call(arguments: [dice]).dig(:result, :total)
            damage_rolls << value

            value = roll_command.call(arguments: [crit_dice]).dig(:result, :total) if values[:fatal]
            if values[:crit]
              crit_value = roll_command.call(arguments: [crit_dice]).dig(:result, :total)
              crit_rolls.push(value, crit_value)
            else
              crit_rolls.push(value, value)
            end

            crit_rolls << roll_command.call(arguments: [values[:deadly]]).dig(:result, :total) if values[:deadly]
            crit_rolls << roll_command.call(arguments: [values[:fatal]]).dig(:result, :total) if values[:fatal]
          end

          damage = values[:dices_bonus].to_i + damage_rolls.sum
          crit_damage = (values[:dices_bonus].to_i * 2) + crit_rolls.sum

          [
            main_check,
            adv_check,
            final_roll,
            final_roll + values[:bonus].to_i,
            damage,
            crit_damage,
            damage_rolls,
            crit_rolls,
            values[:dices_bonus].to_i,
            values[:dices_bonus].to_i * 2
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
