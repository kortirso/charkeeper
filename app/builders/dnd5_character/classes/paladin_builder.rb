# frozen_string_literal: true

module Dnd5Character
  module Classes
    class PaladinBuilder
      WEAPON_CORE = ['light weapon', 'martial weapon'].freeze
      ARMOR = ['light armor', 'medium armor', 'heavy armor', 'shield'].freeze

      def call(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:abilities] = { str: 13, dex: 10, con: 12, int: 11, wis: 14, cha: 15 }
        result[:health] = { current: 11, max: 11, temp: 0 }
        result[:hit_dice][10] = 1

        result
      end
    end
  end
end
