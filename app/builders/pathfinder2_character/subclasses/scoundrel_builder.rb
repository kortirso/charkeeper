# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class ScoundrelBuilder
      def call(result:)
        result[:skill_boosts].merge!({ diplomacy: 1, deception: 1 }) { |_, oldval, newval| oldval + newval }

        result
      end
    end
  end
end
