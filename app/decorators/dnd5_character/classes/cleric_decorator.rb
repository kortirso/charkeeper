# frozen_string_literal: true

module Dnd5Character
  module Classes
    class ClericDecorator
      WEAPON_CORE = ['light weapon'].freeze
      ARMOR = ['light armor', 'medium armor', 'shield'].freeze

      def decorate_fresh_character(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:abilities] = { str: 11, dex: 10, con: 12, int: 13, wis: 15, cha: 14 }
        result[:health] = { current: 9, max: 9, temp: 0 }

        result
      end

      def decorate_character_abilities(result:, class_level:)
        result[:class_save_dc] = %i[wis cha] if result[:main_class] == 'cleric'
        result[:hit_dice][8] += class_level

        result
      end
    end
  end
end
