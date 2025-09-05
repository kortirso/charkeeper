# frozen_string_literal: true

module BotContext
  module Commands
    class Roll
      include Deps[roll: 'roll']

      def call(arguments:)
        total = 0
        rolls = arguments.filter_map do |argument|
          dice, modifier = argument.gsub(/\s+/, '').split('+')
          roll_result = roll.call(dice: dice, modifier: modifier.to_i)
          total += roll_result
          [argument, roll_result]
        rescue StandardError => _e
          next
        end
        { rolls: rolls, total: total }
      end
    end
  end
end
