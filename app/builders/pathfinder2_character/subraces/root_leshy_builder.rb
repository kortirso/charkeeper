# frozen_string_literal: true

module Pathfinder2Character
  module Subraces
    class RootLeshyBuilder
      def call(result:)
        result[:health] = 10

        result
      end
    end
  end
end
