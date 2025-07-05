# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class SpinnerOfThreadsBuilder
      def call(result:)
        result[:skill_boosts].merge!({ occultism: 1 }) { |_, oldval, newval| oldval + newval }
        result[:spell_list] = 'occult'

        result
      end
    end
  end
end
