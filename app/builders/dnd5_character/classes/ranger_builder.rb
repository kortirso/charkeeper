# frozen_string_literal: true

module Dnd5Character
  module Classes
    class RangerBuilder
      WEAPON_CORE = ['light weapon', 'martial weapon'].freeze
      ARMOR = ['light armor', 'medium armor', 'shield'].freeze

      def call(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:abilities] = { str: 15, dex: 14, con: 13, int: 12, wis: 11, cha: 10 }
        result[:health] = { current: 9, max: 9, temp: 0 }

        result
      end
    end
  end
end
