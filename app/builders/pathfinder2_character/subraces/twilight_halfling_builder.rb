# frozen_string_literal: true

module Pathfinder2Character
  module Subraces
    class TwilightHalflingBuilder
      def call(result:)
        result[:vision] = 'low-light'

        result
      end
    end
  end
end
