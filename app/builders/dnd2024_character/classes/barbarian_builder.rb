# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class BarbarianBuilder
      WEAPON_CORE = ['light weapon', 'martial weapon'].freeze
      ARMOR = ['light armor', 'medium armor', 'shield'].freeze

      def call(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:abilities] = { str: 15, dex: 13, con: 14, int: 10, wis: 11, cha: 12 }
        result[:health] = { current: 14, max: 14, temp: 0 }
        result[:hit_dice][12] = 1

        result
      end
    end
  end
end
