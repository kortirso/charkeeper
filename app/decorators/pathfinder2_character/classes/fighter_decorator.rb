# frozen_string_literal: true

module Pathfinder2Character
  module Classes
    class FighterDecorator
      def decorate_fresh_character(result:)
        result[:abilities] = { str: 15, dex: 13, con: 14, int: 10, wis: 11, cha: 12 }
        result[:health] = { current: result[:health] + 10, max: result[:health] + 10, temp: 0 }

        result
      end

      def decorate_character_abilities(result:, class_level:) # rubocop: disable Lint/UnusedMethodArgument
        result
      end
    end
  end
end
