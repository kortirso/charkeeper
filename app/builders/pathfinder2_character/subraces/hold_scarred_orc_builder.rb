# frozen_string_literal: true

module Pathfinder2Character
  module Subraces
    class HoldScarredOrcBuilder
      def call(result:)
        result[:health] = 12

        result
      end
    end
  end
end
