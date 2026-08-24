# frozen_string_literal: true

module BotContextV2
  module Commands
    module Checks
      class NimbleAttack
        include Deps[roll_command: 'services.bot_context_v2.commands.rolls.default']

        SPECIAL_DICES = [44, 66, 88].freeze

        def call(arguments: [])
          {
            type: 'attack',
            target: 'attack',
            result: rolls(arguments),
            errors: nil
          }
        end

        private

        def rolls(arguments) # rubocop: disable Metrics/AbcSize, Metrics/PerceivedComplexity, Metrics/CyclomaticComplexity, Metrics/MethodLength
          target = arguments.shift
          values = BotContextV2::Commands::Parsers::MakeCheck.new.call(arguments: arguments) # { adv: 1, bonus: 1 }
          amount, dice_size = target.split('d').map(&:to_i)
          return make_special_roll(dice_size.to_s[0], values) if SPECIAL_DICES.include?(dice_size)

          primary_roll = find_primary_roll(dice_size, values[:adv], values[:primary_bonus].to_i)
          if values[:miss] && primary_roll == 1
            return { status: 'miss', rolls: [1], primary_rolls: [1], secondary_rolls: [], crit_rolls: [], vicious_rolls: [] }
          end

          return { status: 'success', total: values[:damage] } if values[:damage]

          secondary_rolls = (0...(amount - 1)).map { find_primary_roll(dice_size, values[:adv], 0) }
          crit_value = dice_size - values[:critbonus].to_i
          crit_rolls = values[:crit] && primary_roll >= crit_value ? find_crit_roll(dice_size, 0, [], crit_value) : []
          vicious_rolls = values[:vicious] && crit_rolls.any? ? [find_primary_roll(dice_size, 0, 0)] : []

          {
            status: 'success',
            total: primary_roll + secondary_rolls.sum + crit_rolls.sum + vicious_rolls.sum + values[:bonus].to_i,
            rolls: [primary_roll] + secondary_rolls + crit_rolls + vicious_rolls,
            primary_rolls: [primary_roll],
            secondary_rolls: secondary_rolls,
            crit_rolls: crit_rolls,
            vicious_rolls: vicious_rolls,
            bonus: values[:bonus].to_i
          }
        end

        def make_special_roll(dice_size, values) # rubocop: disable Metrics/AbcSize
          totals = (0...(2 + values[:adv].to_i.abs)).map { roll_command.call(arguments: ["d#{dice_size}"]).dig(:result, :total) }
          results = values[:adv].to_i.positive? ? totals.max(2).shuffle : totals.min(2).shuffle
          {
            status: 'success',
            total: (results[0] * 10) + results[1] + values[:bonus].to_i,
            rolls: [(results[0] * 10) + results[1]],
            bonus: values[:bonus].to_i
          }
        end

        def find_crit_roll(dice_size, adv, acc, crit_value)
          primary_roll = find_primary_roll(dice_size, adv, 0)
          acc << primary_roll
          return acc if primary_roll < crit_value

          find_crit_roll(dice_size, adv, acc, crit_value)
        end

        def find_primary_roll(dice_size, adv, primary_bonus)
          totals = (0..adv.to_i.abs).map { roll_command.call(arguments: ["d#{dice_size}"]).dig(:result, :total) }
          totals.map! { |total| [total + primary_bonus, dice_size].min } if primary_bonus.positive?
          totals.map! { |total| [total - primary_bonus, 1].max } if primary_bonus.negative?
          adv.to_i.positive? ? totals.max : totals.min
        end
      end
    end
  end
end
