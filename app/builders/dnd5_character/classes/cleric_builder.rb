# frozen_string_literal: true

module Dnd5Character
  module Classes
    class ClericBuilder
      WEAPON_CORE = ['light weapon'].freeze
      ARMOR = ['light armor', 'medium armor', 'shield'].freeze

      def call(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:abilities] = { str: 11, dex: 10, con: 12, int: 13, wis: 15, cha: 14 }
        result[:health] = { current: 9, max: 9, temp: 0 }

        result
      end
    end
  end
end
