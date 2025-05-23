# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class SorcererBuilder
      WEAPON_CORE = ['light weapon'].freeze

      def call(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:abilities] = { str: 10, dex: 11, con: 14, int: 13, wis: 12, cha: 15 }
        result[:health] = { current: 8, max: 8, temp: 0 }
        result[:hit_dice][6] = 1

        result
      end
    end
  end
end
