# frozen_string_literal: true

module BotContextV2
  module Commands
    module Checks
      class NimbleAttack
        include Deps[roll_command: 'services.bot_context_v2.commands.rolls.default']

        def call(arguments: [])
          {
            type: 'attack',
            target: 'attack',
            result: rolls(arguments),
            errors: nil
          }
        end

        private

        def rolls(arguments) # rubocop: disable Metrics/AbcSize
          target = arguments.shift
          values = BotContextV2::Commands::Parsers::MakeCheck.new.call(arguments: arguments) # { adv: 1, bonus: 1 }
          amount, dice_size = target.split('d').map(&:to_i)

          primary_roll = find_primary_roll(dice_size, values[:adv])
          return { status: 'miss', rolls: [1] } if primary_roll == 1
          return { status: 'success', total: values[:damage] } if values[:damage]

          secondary_rolls = (0...(amount - 1)).map { find_primary_roll(dice_size, values[:adv]) }
          crit_rolls = values[:crit] && primary_roll == dice_size ? find_crit_roll(dice_size, 0, []) : []

          {
            status: 'success',
            total: primary_roll + secondary_rolls.sum + crit_rolls.sum + values[:bonus],
            rolls: [primary_roll] + secondary_rolls + crit_rolls,
            bonus: values[:bonus]
          }
        end

        def find_crit_roll(dice_size, adv, acc)
          primary_roll = find_primary_roll(dice_size, adv)
          acc << primary_roll
          return acc if primary_roll != dice_size

          find_crit_roll(dice_size, adv, acc)
        end

        def find_primary_roll(dice_size, adv)
          totals = (0..adv.to_i.abs).map { roll_command.call(arguments: ["d#{dice_size}"]).dig(:result, :total) }
          adv.to_i.positive? ? totals.max : totals.min
        end
      end
    end
  end
end
