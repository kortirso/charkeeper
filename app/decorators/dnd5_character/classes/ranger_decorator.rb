# frozen_string_literal: true

module Dnd5Character
  module Classes
    class RangerDecorator
      WEAPON_CORE = ['light weapon', 'martial weapon'].freeze
      ARMOR = ['light armor', 'medium armor', 'shield'].freeze

      def decorate_fresh_character(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:abilities] = { str: 15, dex: 14, con: 13, int: 12, wis: 11, cha: 10 }
        result[:health] = { current: 9, max: 9, temp: 0 }

        result
      end

      def decorate_character_abilities(result:, class_level:)
        result[:class_save_dc] = %i[str dex] if result[:main_class] == 'ranger'
        result[:hit_dice][10] += class_level

        result[:combat][:attacks_per_action] = 2 if class_level >= 5 # Extra Attack, 5 level

        result
      end
    end
  end
end
