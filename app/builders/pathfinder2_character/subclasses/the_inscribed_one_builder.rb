# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class TheInscribedOneBuilder
      def call(result:)
        result[:skill_boosts].merge!({ arcana: 1 }) { |_, oldval, newval| oldval + newval }
        result[:spell_list] = 'arcane'

        result
      end
    end
  end
end
