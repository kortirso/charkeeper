# frozen_string_literal: true

module Nimble
  module Classes
    class MageDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        @result['keys'] = %w[int wil]
        @result['hit_die'] = 6
        @result['saves'] = %w[int str]
        @result['armors'] = %w[clothes]

        @result['schools'] = %w[fire ice lightning]
        @result['mana_max'] = level >= 2 ? ((modified_abilities['int'] * 3) + level) : 0
        @result['spell_level'] = level / 2
        @result['utility_spells_limit'] = %w[fire ice lightning].index_with(0)

        @result
      end
    end
  end
end
