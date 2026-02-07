# frozen_string_literal: true

module Pathfinder2Character
  module Races
    class HumanBuilder
      LANGUAGES = %w[common].freeze

      def call(result:)
        result[:speed] = 25
        result[:health] = 8
        result[:languages] = result[:languages].concat(LANGUAGES).uniq
        result[:ability_boosts].merge!({ free: 2 }) { |_, oldval, newval| oldval + newval }

        result[:ability_boosts_v2][:race] = { free: 2 }

        result
      end
    end
  end
end
