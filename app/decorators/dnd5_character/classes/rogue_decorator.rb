# frozen_string_literal: true

module Dnd5Character
  module Classes
    class RogueDecorator
      WEAPON_CORE = ['light weapon'].freeze
      DEFAULT_WEAPON_SKILLS = %w[longsword shortsword rapier hand_crossbow].freeze
      ARMOR = ['light armor'].freeze

      def decorate_fresh_character(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:weapon_skills] = result[:weapon_skills].concat(DEFAULT_WEAPON_SKILLS).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq

        result
      end
    end
  end
end
