# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class MastermindBuilder
      def call(result:)
        result[:skill_boosts].merge!({ society: 1, arcana_nature_occultism_religion: 1 }) { |_, oldval, newval| oldval + newval }

        result
      end
    end
  end
end
