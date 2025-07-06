# frozen_string_literal: true

module Pathfinder2Character
  module Subraces
    class SeeweedLeshyBuilder
      def call(result:)
        result[:speed] = 20

        result
      end
    end
  end
end
