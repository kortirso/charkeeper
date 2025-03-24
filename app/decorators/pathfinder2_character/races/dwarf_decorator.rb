# frozen_string_literal: true

module Pathfinder2Character
  module Races
    class DwarfDecorator
      LANGUAGES = %w[common dwarven].freeze

      def decorate_fresh_character(result:)
        result[:health] = 10
        result[:speed] = 20
        result[:languages] = result[:languages].concat(LANGUAGES).uniq

        result
      end

      def decorate_character_abilities(result:)
        result
      end
    end
  end
end
