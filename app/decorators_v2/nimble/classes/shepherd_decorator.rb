# frozen_string_literal: true

module Nimble
  module Classes
    class ShepherdDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        @result['keys'] = %w[wil str]
        @result['hit_die'] = 10
        @result['saves'] = %w[wil dex]
        @result['armors'] = %w[mail shield]

        @result['schools'] = %w[radiant necrotic]
        @result['mana_max'] = level >= 2 ? ((modified_abilities['wil'] * 3) + level) : 0
        @result['spell_level'] = spell_levels
        @result['utility_spells_limit'] = %w[radiant necrotic].index_with(utility_spells_limits)

        @result
      end

      private

      def spell_levels
        level / 2
      end

      def utility_spells_limits
        return 3 if level >= 11
        return 2 if level >= 6

        level >= 3 ? 1 : 0
      end
    end
  end
end
