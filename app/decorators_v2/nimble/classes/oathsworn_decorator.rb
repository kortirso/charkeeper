# frozen_string_literal: true

module Nimble
  module Classes
    class OathswornDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        @result['keys'] = %w[str wil]
        @result['hit_die'] = 10
        @result['saves'] = %w[str dex]
        @result['armors'] = %w[clothes leather mail plate shield]

        @result['schools'] = level >= 2 ? %w[radiant] : []
        @result['mana_max'] = level >= 2 ? (modified_abilities['wil'] + level) : 0
        @result['spell_level'] = spell_levels
        @result['utility_spells_limit'] = %w[radiant].index_with(utility_spells_limits)

        @result
      end

      private

      def spell_levels
        return -1 if level < 2
        return 7 if level >= 17
        return 6 if level >= 13

        level / 2
      end

      def utility_spells_limits
        return 2 if level >= 11

        level >= 7 ? 1 : 0
      end
    end
  end
end
