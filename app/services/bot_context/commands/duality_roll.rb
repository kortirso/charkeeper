# frozen_string_literal: true

module BotContext
  module Commands
    class DualityRoll
      include Deps[roll: 'roll']

      def call(arguments:)
        total = 0
        rolls = arguments.filter_map do |argument|
          dice, modifier = argument.gsub(/\s+/, '').split('+')
          roll_result = dice.include?('d') ? roll.call(dice: dice, modifier: modifier.to_i) : dice.to_i
          total += roll_result
          [argument, roll_result]
        rescue StandardError => _e
          next
        end

        if rolls.any?
          return {
            type: 'make_roll',
            result: { rolls: rolls, total: total, status: status(rolls.dig(0, 1), rolls.dig(1, 1)) }
          }
        end

        { errors: [I18n.t('services.bot_context.representers.roll.nothing')] }
      end

      private

      def status(hope_value, fear_value)
        return :crit_success if hope_value == fear_value

        hope_value > fear_value ? :with_hope : :with_fear
      end
    end
  end
end
