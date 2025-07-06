# frozen_string_literal: true

module Pathfinder2Character
  module Subraces
    class UmbralBuilder
      def call(result:)
        result[:vision] = 'dark'

        result
      end
    end
  end
end
