# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class SilenceInSnowBuilder
      def call(result:)
        result[:skill_boosts].merge!({ nature: 1 }) { |_, oldval, newval| oldval + newval }
        result[:spell_list] = 'primal'

        result
      end
    end
  end
end
