# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class RuffianBuilder
      def call(result:)
        result[:skill_boosts].merge!({ intimidation: 1 }) { |_, oldval, newval| oldval + newval }
        result[:armor_skills] = { unarmored: 1, light: 1, medium: 1, heavy: 0 }

        result
      end
    end
  end
end
