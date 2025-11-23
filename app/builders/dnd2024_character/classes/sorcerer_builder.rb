# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class SorcererBuilder
      WEAPON_CORE = ['light'].freeze

      def call(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:abilities] = { str: 10, dex: 13, con: 14, int: 8, wis: 12, cha: 15 }
        result[:health] = { current: 8, max: 8, temp: 0 }
        result[:skill_boosts] += 2
        result[:skill_boosts_list] = %w[arcana deception insight intimidation persuasion religion]

        result
      end
    end
  end
end
