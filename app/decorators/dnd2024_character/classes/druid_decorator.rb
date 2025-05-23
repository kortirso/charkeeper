# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class DruidDecorator < ApplicationDecorator
      CLASS_SAVE_DC = %w[int wis].freeze

      def class_save_dc
        @class_save_dc ||= main_class == 'druid' ? CLASS_SAVE_DC : __getobj__.class_save_dc
      end

      def spell_classes
        @spell_classes ||= begin
          result = __getobj__.spell_classes
          result[:druid] = {
            save_dc: 8 + proficiency_bonus + modifiers['wis'],
            attack_bonus: proficiency_bonus + modifiers['wis'],
            cantrips_amount: cantrips_amount,
            max_spell_level: max_spell_level,
            prepared_spells_amount: prepared_spells_amount,
            multiclass_spell_level: class_level # full level
          }
          result
        end
      end

      def spells_slots
        @spells_slots ||= ::Dnd2024Character::ClassDecorateWrapper::SPELL_SLOTS[class_level]
      end

      private

      def class_level
        @class_level ||= classes['druid']
      end

      def cantrips_amount
        return 4 if class_level >= 17
        return 3 if class_level >= 4

        2
      end

      def prepared_spells_amount
        return class_level + 2 if class_level >= 16
        return class_level + 3 if class_level >= 14
        return class_level + 4 if class_level >= 12
        return class_level + 5 if class_level >= 9
        return class_level + 4 if class_level >= 5

        class_level + 3
      end

      def max_spell_level
        ::Dnd2024Character::ClassDecorateWrapper::SPELL_SLOTS[class_level].keys.max
      end
    end
  end
end
