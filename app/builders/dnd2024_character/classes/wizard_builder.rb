# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class WizardBuilder
      WEAPON_CORE = ['light'].freeze

      def call(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:abilities] = { str: 8, dex: 12, con: 13, int: 15, wis: 14, cha: 10 }
        result[:health] = { current: 7, max: 7, temp: 0 }
        result[:skill_boosts] += 2
        result[:skill_boosts_list] = %w[arcana history insight investigation medicine nature religion]

        result
      end
    end
  end
end
