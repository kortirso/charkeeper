# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class RangerBuilder
      WEAPON_CORE = %w[light martial].freeze
      ARMOR = %w[light medium shield].freeze

      def call(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:abilities] = { str: 12, dex: 15, con: 13, int: 8, wis: 14, cha: 10 }
        result[:health] = { current: 11, max: 11, temp: 0 }
        result[:skill_boosts] += 3
        result[:skill_boosts_list] = %w[animal athletics insight investigation nature perception stealth survival]

        result
      end
    end
  end
end
