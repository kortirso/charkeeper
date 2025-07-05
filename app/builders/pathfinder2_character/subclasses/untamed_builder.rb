# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class UntamedBuilder
      def call(result:)
        result[:skill_boosts].merge!({ intimidation: 1 }) { |_, oldval, newval| oldval + newval }

        result
      end
    end
  end
end
