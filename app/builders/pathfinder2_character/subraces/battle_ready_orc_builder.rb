# frozen_string_literal: true

module Pathfinder2Character
  module Subraces
    class BattleReadyOrcBuilder
      def call(result:)
        result[:skill_boosts].merge!({ intimidation: 1 }) { |_, oldval, newval| oldval + newval }

        result
      end
    end
  end
end
