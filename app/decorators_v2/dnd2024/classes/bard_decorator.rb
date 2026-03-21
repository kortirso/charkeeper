# frozen_string_literal: true

module Dnd2024
  module Classes
    class BardDecorator < ApplicationDecoratorV2
      CLASS_SAVE_DC = %w[dex cha].freeze

      def call(result:)
        @result = result
        @result['class_save_dc'] = CLASS_SAVE_DC if main_class == 'bard'
        @result['spell_classes']['bard'] = spell_class_info
        @result['spells_slots'] = spells_slots
        find_static_spells
        @result
      end

      private

      def spell_class_info
        {
          save_dc: 8 + proficiency_bonus + modifiers['cha'],
          attack_bonus: proficiency_bonus + modifiers['cha'],
          cantrips_amount: cantrips_amount,
          max_spell_level: max_spell_level,
          prepared_spells_amount: prepared_spells_amount,
          multiclass_spell_level: class_level # full level
        }
      end

      def spells_slots
        ::Dnd2024::SubclassDecorator::SPELL_SLOTS[class_level] || ::Dnd2024::SubclassDecorator::SPELL_SLOTS[20]
      end

      def static_spells
        return unless class_level >= 20

        @result['static_spells']['power_word_heal'] = static_spell_attributes
        @result['static_spells']['power_word_kill'] = static_spell_attributes
      end

      def class_level
        @class_level ||= classes['bard']
      end

      def cantrips_amount
        return 4 if class_level >= 10
        return 3 if class_level >= 4

        2
      end

      def prepared_spells_amount
        return class_level + 2 if class_level >= 16
        return 18 if class_level >= 15
        return 17 if class_level >= 13
        return 16 if class_level >= 12
        return class_level + 5 if class_level >= 9
        return class_level + 4 if class_level >= 5

        class_level + 3
      end

      def max_spell_level
        ::Dnd2024::SubclassDecorator::SPELL_SLOTS[class_level].keys.max
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['cha'], 'save_dc' => 8 + proficiency_bonus + modifiers['cha'] }
      end
    end
  end
end
