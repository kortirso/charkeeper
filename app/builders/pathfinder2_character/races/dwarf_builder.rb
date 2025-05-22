# frozen_string_literal: true

module Pathfinder2Character
  module Races
    class DwarfBuilder
      LANGUAGES = %w[common dwarven].freeze

      def call(result:)
        result[:health] = 10
        result[:speed] = 20
        result[:languages] = result[:languages].concat(LANGUAGES).uniq

        result
      end
    end
  end
end
