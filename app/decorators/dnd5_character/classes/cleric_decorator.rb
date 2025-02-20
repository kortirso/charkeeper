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

      # rubocop: disable Metrics/AbcSize
      def decorate_character_abilities(result:, class_level:)
        result[:class_save_dc] = %i[wis cha] if result[:main_class] == 'cleric'
        result[:spell_classes][:cleric] = {
          save_dc: 8 + result[:proficiency_bonus] + result.dig(:modifiers, :wis),
          attack_bonus: result[:proficiency_bonus] + result.dig(:modifiers, :wis),
          cantrips_amount: cantrips_amount(class_level),
          max_spell_level: max_spell_level(class_level),
          prepared_spells_amount: [result.dig(:modifiers, :wis) + class_level, 1].max
        }
        result[:spells_slots] = spells_slots(class_level)
        result[:hit_dice][8] += class_level

        result
      end
      # rubocop: enable Metrics/AbcSize

      private

      def cantrips_amount(class_level)
        return 5 if class_level >= 10
        return 4 if class_level >= 4

        3
      end

      def max_spell_level(class_level)
        ::Dnd5Character::ClassDecorateWrapper::SPELL_SLOTS[class_level].keys.max
      end

      def spells_slots(class_level)
        ::Dnd5Character::ClassDecorateWrapper::SPELL_SLOTS[class_level]
      end
    end
  end
end
