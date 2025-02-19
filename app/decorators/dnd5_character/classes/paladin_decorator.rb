# frozen_string_literal: true

module Dnd5Character
  module Classes
    class PaladinDecorator
      WEAPON_CORE = ['light weapon', 'martial weapon'].freeze
      ARMOR = ['light armor', 'medium armor', 'heavy armor', 'shield'].freeze
      IMMUNITIES = %w[disease].freeze

      def decorate_fresh_character(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:abilities] = { str: 13, dex: 10, con: 12, int: 11, wis: 14, cha: 15 }
        result[:health] = { current: 11, max: 11, temp: 0 }

        result
      end

      def decorate_character_abilities(result:, class_level:)
        result[:class_save_dc] = %i[wis cha] if result[:main_class] == 'paladin'
        result[:hit_dice][10] += class_level

        result[:immunities] = result[:immunities].concat(IMMUNITIES).uniq
        result[:combat][:attacks_per_action] = 2 if class_level >= 5 # Extra Attack, 5 level

        result
      end
    end
  end
end
