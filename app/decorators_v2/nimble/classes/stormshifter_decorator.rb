# frozen_string_literal: true

module Nimble
  module Classes
    class StormshifterDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        @result['keys'] = %w[wil dex]
        @result['hit_die'] = 8
        @result['saves'] = %w[wil str]
        @result['armors'] = %w[clothes leather]

        @result['schools'] = %w[lightning wind]
        @result['mana_max'] = level >= 2 ? ((modified_abilities['wil'] * 3) + level) : 0
        @result['spell_level'] = spell_levels
        @result['utility_spells_limit'] = %w[lightning wind].index_with(utility_spells_limits)

        @result
      end

      private

      def spell_levels
        level / 2
      end

      def utility_spells_limits
        return 2 if level >= 7

        level >= 4 ? 1 : 0
      end
    end
  end
end
