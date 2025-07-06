# frozen_string_literal: true

module Pathfinder2Character
  module Races
    class LeshyBuilder
      LANGUAGES = %w[common fey].freeze

      def call(result:)
        result[:speed] = 25
        result[:health] = 8
        result[:languages] = result[:languages].split(', ').concat(LANGUAGES).uniq.join(', ')
        result[:abilities].merge!({ int: -2, con: 2, wis: 2 }) { |_, oldval, newval| oldval + newval }
        result[:ability_boosts].merge!({ free: 1 }) { |_, oldval, newval| oldval + newval }
        result[:vision] = 'low-light'

        result
      end
    end
  end
end
