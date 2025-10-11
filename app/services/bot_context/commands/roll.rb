# frozen_string_literal: true

module BotContext
  module Commands
    class Roll
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

        return { type: 'make_roll', result: { rolls: rolls, total: total } } if rolls.any?

        { errors: [I18n.t('services.bot_context.representers.roll.nothing')] }
      end
    end
  end
end
