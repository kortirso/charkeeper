# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class ClericBuilder
      WEAPON_CORE = ['light'].freeze
      ARMOR = %w[light medium shield].freeze

      def call(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:abilities] = { str: 14, dex: 8, con: 13, int: 10, wis: 15, cha: 12 }
        result[:health] = { current: 9, max: 9, temp: 0 }
        result[:skill_boosts] += 2
        result[:skill_boosts_list] = %w[history insight medicine persuasion religion]

        result
      end
    end
  end
end
