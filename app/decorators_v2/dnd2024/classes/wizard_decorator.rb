# frozen_string_literal: true

module Dnd2024
  module Classes
    class WizardDecorator < ApplicationDecoratorV2
      CLASS_SAVE_DC = %w[int wis].freeze

      def call(result:)
        @result = result
        @result['class_save_dc'] = CLASS_SAVE_DC if main_class == 'wizard'
        @result['spell_classes']['wizard'] = spell_class_info
        @result['spells_slots'] = spells_slots
        @result
      end

      private

      def spell_class_info
        {
          save_dc: 8 + proficiency_bonus + modifiers['int'],
          attack_bonus: proficiency_bonus + modifiers['int'],
          cantrips_amount: cantrips_amount,
          max_spell_level: max_spell_level,
          prepared_spells_amount: prepared_spells_amount,
          multiclass_spell_level: class_level # full level
        }
      end

      def spells_slots
        ::Dnd2024::SubclassDecorator::SPELL_SLOTS[class_level] || ::Dnd2024::SubclassDecorator::SPELL_SLOTS[20]
      end

      def class_level
        @class_level ||= classes['wizard']
      end

      def cantrips_amount
        return 5 if class_level >= 10
        return 4 if class_level >= 4

        3
      end

      def prepared_spells_amount
        return class_level + 5 if class_level >= 16
        return class_level + 4 if class_level >= 12
        return class_level + 5 if class_level >= 9
        return class_level + 4 if class_level >= 5

        class_level + 3
      end

      def max_spell_level
        ::Dnd2024::SubclassDecorator::SPELL_SLOTS[class_level].keys.max
      end
    end
  end
end
