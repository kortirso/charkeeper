# frozen_string_literal: true

module Nimble
  module Classes
    class SongweaverDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        @result['keys'] = %w[wil int]
        @result['hit_die'] = 8
        @result['saves'] = %w[wil str]
        @result['armors'] = %w[clother leather]

        @result['schools'] = %w[wind]
        @result['mana_max'] = level >= 2 ? ((modified_abilities['int'] * 3) + level) : 0
        @result['spell_level'] = spell_levels
        @result['utility_spells_limit'] = %w[wind].index_with(utility_spells_limits)

        @result
      end

      private

      def spell_levels
        level / 2
      end

      def utility_spells_limits
        return 3 if level >= 14
        return 2 if level >= 6

        level >= 3 ? 1 : 0
      end
    end
  end
end
