# frozen_string_literal: true

module Dnd5Character
  module Classes
    class BardBuilder
      WEAPON_CORE = ['light'].freeze
      DEFAULT_WEAPON_SKILLS = %w[longsword shortsword rapier hand_crossbow].freeze
      ARMOR = ['light'].freeze

      def call(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:weapon_skills] = result[:weapon_skills].concat(DEFAULT_WEAPON_SKILLS).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:abilities] = { str: 10, dex: 14, con: 11, int: 12, wis: 13, cha: 15 }
        result[:health] = { current: 8, max: 8, temp: 0 }

        result
      end
    end
  end
end
