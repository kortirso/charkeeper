# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class BarbarianBuilder
      WEAPON_CORE = %w[light martial].freeze
      ARMOR = %w[light medium shield].freeze

      def call(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:abilities] = { str: 15, dex: 13, con: 14, int: 8, wis: 12, cha: 10 }
        result[:health] = { current: 14, max: 14, temp: 0 }
        result[:skill_boosts] += 2
        result[:skill_boosts_list] = %w[animal athletics nature intimidation perception survival]

        result
      end
    end
  end
end
