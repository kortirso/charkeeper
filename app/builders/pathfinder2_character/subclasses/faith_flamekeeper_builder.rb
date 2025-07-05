# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class FaithFlamekeeperBuilder
      def call(result:)
        result[:skill_boosts].merge!({ religion: 1 }) { |_, oldval, newval| oldval + newval }
        result[:spell_list] = 'divine'

        result
      end
    end
  end
end
