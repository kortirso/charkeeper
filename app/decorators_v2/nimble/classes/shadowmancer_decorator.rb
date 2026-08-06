# frozen_string_literal: true

module Nimble
  module Classes
    class ShadowmancerDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        @result['keys'] = %w[int dex]
        @result['hit_die'] = 8
        @result['saves'] = %w[int wil]
        @result['armors'] = %w[clothes]

        @result['schools'] = level >= 2 ? %w[necrotic] : []
        @result['mana_max'] = level >= 2 ? modified_abilities['dex'] : 0
        @result['spell_level'] = spell_levels
        @result['utility_spells_limit'] = %w[necrotic].index_with(utility_spells_limits)

        @result
      end

      private

      def spell_levels
        return -1 if level < 2
        return (level + 2) / 3 if level >= 7
        return 2 if level >= 5

        1
      end

      def utility_spells_limits
        return 3 if level >= 14
        return 2 if level >= 8

        level >= 6 ? 1 : 0
      end
    end
  end
end
