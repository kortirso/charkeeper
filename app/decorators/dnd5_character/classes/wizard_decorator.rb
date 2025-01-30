# frozen_string_literal: true

module Dnd5Character
  module Classes
    class WizardDecorator
      DEFAULT_WEAPON_SKILLS = ['Quarterstaff', 'Dart', 'Dagger', 'Sling', 'Light Crossbow'].freeze

      def decorate_fresh_character(result:)
        result[:weapon_skills] = result[:weapon_skills].concat(DEFAULT_WEAPON_SKILLS)

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
          prepared_spells_amount: [result.dig(:modifiers, :int) + class_level, 1].max
        }
        result[:spells_slots] = spells_slots(class_level)

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
