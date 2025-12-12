# frozen_string_literal: true

module Pathfinder2Character
  module Races
    class OrcBuilder
      LANGUAGES = %w[common orcish].freeze

      def call(result:)
        result[:speed] = 25
        result[:health] = 10
        result[:languages] = result[:languages].split(', ').concat(LANGUAGES).uniq.join(', ')
        result[:ability_boosts].merge!({ free: 2 }) { |_, oldval, newval| oldval + newval }
        result[:vision] = 'dark'

        result[:ability_boosts_v2][:race] = { free: 2 }

        result
      end
    end
  end
end
