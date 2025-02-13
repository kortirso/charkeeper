# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class WizardDecorator
      WEAPON_CORE = ['light weapon'].freeze

      def decorate_fresh_character(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:abilities] = { str: 10, dex: 12, con: 11, int: 15, wis: 14, cha: 13 }
        result[:health] = { current: 6, max: 6, temp: 0 }

        result
      end

      # rubocop: disable Metrics/AbcSize
      def decorate_character_abilities(result:, class_level:)
        result[:class_save_dc] = %i[int wis] if result[:main_class] == 'wizard'
        result[:spell_classes][:wizard] = {
          save_dc: 8 + result[:proficiency_bonus] + result.dig(:modifiers, :int),
          attack_bonus: result[:proficiency_bonus] + result.dig(:modifiers, :int),
          cantrips_amount: cantrips_amount(class_level),
          max_spell_level: max_spell_level(class_level),
          prepared_spells_amount: prepared_spells_amount(class_level)
        }
        result[:spells_slots] = spells_slots(class_level)
        result[:hit_dice][6] += class_level

        result
      end
      # rubocop: enable Metrics/AbcSize

      private

      def cantrips_amount(class_level)
        return 5 if class_level >= 10
        return 4 if class_level >= 4

        3
      end

      def prepared_spells_amount(class_level)
        return class_level + 5 if class_level >= 16
        return class_level + 4 if class_level >= 12
        return class_level + 5 if class_level >= 9
        return class_level + 4 if class_level >= 5

        class_level + 3
      end

      def max_spell_level(class_level)
        ::Dnd2024Character::ClassDecorateWrapper::SPELL_SLOTS[class_level].keys.max
      end

      def spells_slots(class_level)
        ::Dnd2024Character::ClassDecorateWrapper::SPELL_SLOTS[class_level]
      end
    end
  end
end
