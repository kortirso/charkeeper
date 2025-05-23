# frozen_string_literal: true

module Dnd5Character
  module Classes
    class WarlockBuilder
      WEAPON_CORE = ['light weapon'].freeze
      ARMOR = ['light armor'].freeze

      def call(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:abilities] = { str: 10, dex: 12, con: 11, int: 13, wis: 15, cha: 14 }
        result[:health] = { current: 8, max: 8, temp: 0 }
        result[:hit_dice][8] = 1

        result
      end
    end
  end
end
