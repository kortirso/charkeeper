# frozen_string_literal: true

module Dnd5Character
  module Classes
    class BardDecorator < ApplicationDecorator
      CLASS_SAVE_DC = %w[dex cha].freeze

      def class_save_dc
        @class_save_dc ||= main_class == 'bard' ? CLASS_SAVE_DC : __getobj__.class_save_dc
      end

      def spell_classes
        @spell_classes ||= begin
          result = __getobj__.spell_classes
          result[:bard] = {
            save_dc: 8 + proficiency_bonus + modifiers['cha'],
            attack_bonus: proficiency_bonus + modifiers['cha'],
            cantrips_amount: cantrips_amount,
            spells_amount: spells_amount,
            max_spell_level: max_spell_level,
            prepared_spells_amount: spells_amount,
            multiclass_spell_level: class_level # full level
          }
          result
        end
      end

      def spells_slots
        @spells_slots ||= ::Dnd5Character::ClassDecorateWrapper::SPELL_SLOTS[class_level]
      end

      private

      def class_level
        @class_level ||= classes['bard']
      end

      def cantrips_amount
        return 4 if class_level >= 10
        return 3 if class_level >= 4

        2
      end

      def spells_amount
        return 22 if class_level >= 18
        return 20 if class_level >= 17
        return 19 if class_level >= 15
        return 18 if class_level >= 14
        return 16 if class_level >= 13
        return 15 if class_level >= 11
        return 14 if class_level >= 10

        class_level + 3
      end

      def max_spell_level
        ::Dnd5Character::ClassDecorateWrapper::SPELL_SLOTS[class_level].keys.max
      end
    end
  end
end
