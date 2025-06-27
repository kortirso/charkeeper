# frozen_string_literal: true

module Pathfinder2Character
  module Races
    class HalflingBuilder
      LANGUAGES = %w[common halfling].freeze

      def call(result:)
        result[:speed] = 25
        result[:health] = 6
        result[:languages] = result[:languages].split(', ').concat(LANGUAGES).uniq.join(', ')
        result[:abilities] = result[:abilities].merge({ str: -2, dex: 2, wis: 2 }) { |_, oldval, newval| oldval + newval }
        result[:ability_boosts] = result[:ability_boosts].merge({ free: 1 }) { |_, oldval, newval| oldval + newval }

        result
      end
    end
  end
end
