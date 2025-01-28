# frozen_string_literal: true

module Dnd5NewCharacter
  module Subraces
    class DrowDecorator
      WEAPONS = ['Shortsword', 'Rapier', 'Hand Crossbow'].freeze

      def decorate(result:)
        result[:weapon_skills] = result[:weapon_skills].concat(WEAPONS)

        result
      end
    end
  end
end
