# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class BardBuilder
      WEAPON_CORE = ['light'].freeze
      ARMOR = ['light'].freeze

      def call(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:abilities] = { str: 8, dex: 14, con: 12, int: 13, wis: 10, cha: 15 }
        result[:health] = { current: 9, max: 9, temp: 0 }
        result[:any_skill_boosts] += 3

        result
      end
    end
  end
end
