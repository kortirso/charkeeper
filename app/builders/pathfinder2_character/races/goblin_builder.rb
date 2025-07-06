# frozen_string_literal: true

module Pathfinder2Character
  module Races
    class GoblinBuilder
      LANGUAGES = %w[common goblin].freeze

      def call(result:)
        result[:speed] = 25
        result[:health] = 6
        result[:languages] = result[:languages].split(', ').concat(LANGUAGES).uniq.join(', ')
        result[:abilities].merge!({ wis: -2, dex: 2, cha: 2 }) { |_, oldval, newval| oldval + newval }
        result[:ability_boosts].merge!({ free: 1 }) { |_, oldval, newval| oldval + newval }
        result[:vision] = 'dark'

        result
      end
    end
  end
end
