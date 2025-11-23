# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class FighterBuilder
      WEAPON_CORE = %w[light martial].freeze
      ARMOR = %w[light medium heavy shield].freeze

      def call(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:abilities] = { str: 15, dex: 14, con: 13, int: 8, wis: 10, cha: 12 }
        result[:health] = { current: 11, max: 11, temp: 0 }
        result[:skill_boosts] += 2
        result[:skill_boosts_list] = %w[acrobatics athletics intimidation perception survival history insight persuasion animal]

        result
      end
    end
  end
end
