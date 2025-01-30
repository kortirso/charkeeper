# frozen_string_literal: true

module Dnd5Character
  module Classes
    class WarlockDecorator
      WEAPON_CORE = ['light weapon'].freeze
      ARMOR = ['light armor'].freeze

      def decorate_fresh_character(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq

        result
      end
    end
  end
end
