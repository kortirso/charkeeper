# frozen_string_literal: true

module Dnd5Character
  module Classes
    class ArtificerBuilder
      WEAPON_CORE = ['light weapon'].freeze
      ARMOR = ['light armor', 'medium armor', 'shield'].freeze

      def call(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:abilities] = { str: 11, dex: 12, con: 14, int: 15, wis: 13, cha: 10 }
        result[:health] = { current: 10, max: 10, temp: 0 }
        result[:hit_dice][8] = 1

        result
      end
    end
  end
end
