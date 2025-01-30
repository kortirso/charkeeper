# frozen_string_literal: true

module Dnd5Character
  module Classes
    class BardDecorator
      WEAPON_CORE = ['light weapon'].freeze
      DEFAULT_WEAPON_SKILLS = ['Longsword', 'Shortsword', 'Rapier', 'Hand Crossbow'].freeze
      ARMOR = ['light armor'].freeze

      def decorate_fresh_character(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE)
        result[:weapon_skills] = result[:weapon_skills].concat(DEFAULT_WEAPON_SKILLS)
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR)

        result
      end
    end
  end
end
