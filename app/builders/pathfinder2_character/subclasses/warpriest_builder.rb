# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class WarpriestBuilder
      def call(result:)
        result[:armor_skills] = { unarmored: 1, light: 1, medium: 1, heavy: 0 }
        result[:saving_throws] = { fortitude: 2, reflex: 1, will: 2 }

        result
      end
    end
  end
end
