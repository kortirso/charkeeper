# frozen_string_literal: true

module Pathfinder2Character
  module Races
    class ElfBuilder
      LANGUAGES = %w[common elven].freeze

      def call(result:)
        result[:speed] = 30
        result[:health] = 6
        result[:languages] = result[:languages].split(', ').concat(LANGUAGES).uniq.join(', ')
        result[:abilities].merge!({ con: -2, dex: 2, int: 2 }) { |_, oldval, newval| oldval + newval }
        result[:ability_boosts].merge!({ free: 1 }) { |_, oldval, newval| oldval + newval }
        result[:vision] = 'low-light'

        result
      end
    end
  end
end
