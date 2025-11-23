# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class MonkBuilder
      WEAPON_CORE = ['light'].freeze

      def call(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:abilities] = { str: 12, dex: 15, con: 13, int: 10, wis: 14, cha: 8 }
        result[:health] = { current: 9, max: 9, temp: 0 }
        result[:skill_boosts] += 2
        result[:skill_boosts_list] = %w[acrobatics athletics history insight religion stealth]

        result
      end
    end
  end
end
