# frozen_string_literal: true

module Dnd5NewCharacter
  module Classes
    class WarlockDecorator
      WEAPON_CORE = ['light weapon'].freeze
      ARMOR = ['light armor'].freeze

      def decorate(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE)
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR)

        result
      end
    end
  end
end
