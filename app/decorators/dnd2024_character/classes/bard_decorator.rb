# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class BardDecorator
      WEAPON_CORE = ['light weapon'].freeze
      ARMOR = ['light armor'].freeze

      def decorate_fresh_character(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:abilities] = { str: 10, dex: 14, con: 11, int: 12, wis: 13, cha: 15 }
        result[:health] = { current: 8, max: 8, temp: 0 }

        result
      end

      # rubocop: disable Metrics/AbcSize
      def decorate_character_abilities(result:, class_level:)
        result[:class_save_dc] = %i[dex cha] if result[:main_class] == 'bard'
        result[:spell_classes][:bard] = {
          save_dc: 8 + result[:proficiency_bonus] + result.dig(:modifiers, :cha),
          attack_bonus: result[:proficiency_bonus] + result.dig(:modifiers, :cha),
          cantrips_amount: cantrips_amount(class_level),
          max_spell_level: max_spell_level(class_level),
          prepared_spells_amount: prepared_spells_amount(class_level)
        }
        result[:spells_slots] = spells_slots(class_level)
        result[:hit_dice][8] += class_level

        result
      end

      private

      def cantrips_amount(class_level)
        return 4 if class_level >= 10
        return 3 if class_level >= 4

        2
      end

      def prepared_spells_amount(class_level)
        return class_level + 2 if class_level >= 16
        return 18 if class_level >= 15
        return 17 if class_level >= 13
        return 16 if class_level >= 12
        return class_level + 5 if class_level >= 9
        return class_level + 4 if class_level >= 5

        class_level + 3
      end
      # rubocop: enable Metrics/AbcSize

      def max_spell_level(class_level)
        ::Dnd2024Character::ClassDecorateWrapper::SPELL_SLOTS[class_level].keys.max
      end

      def spells_slots(class_level)
        ::Dnd2024Character::ClassDecorateWrapper::SPELL_SLOTS[class_level]
      end
    end
  end
end
