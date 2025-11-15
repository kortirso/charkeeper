# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class SorcererDecorator < ApplicationDecorator
      CLASS_SAVE_DC = %w[con cha].freeze

      def class_save_dc
        @class_save_dc ||= main_class == 'sorcerer' ? CLASS_SAVE_DC : __getobj__.class_save_dc
      end

      def spell_classes
        @spell_classes ||= begin
          result = __getobj__.spell_classes
          result[:sorcerer] = {
            save_dc: 8 + proficiency_bonus + modifiers['cha'],
            attack_bonus: proficiency_bonus + modifiers['cha'],
            cantrips_amount: cantrips_amount,
            max_spell_level: max_spell_level,
            prepared_spells_amount: prepared_spells_amount,
            multiclass_spell_level: class_level # full level
          }
          result
        end
      end

      def spells_slots
        @spells_slots ||= ::Dnd2024Character::SubclassDecorateWrapper::SPELL_SLOTS[class_level]
      end

      private

      def class_level
        @class_level ||= classes['sorcerer']
      end

      def cantrips_amount
        return 6 if class_level >= 10
        return 5 if class_level >= 4

        4
      end

      # rubocop: disable Metrics/AbcSize
      def prepared_spells_amount
        return class_level + 2 if class_level >= 16
        return class_level + 3 if class_level >= 14
        return class_level + 4 if class_level >= 12
        return class_level + 5 if class_level >= 9
        return class_level + 4 if class_level >= 5
        return class_level + 3 if class_level >= 3

        class_level * 2
      end
      # rubocop: enable Metrics/AbcSize

      def max_spell_level
        ::Dnd2024Character::SubclassDecorateWrapper::SPELL_SLOTS[class_level].keys.max
      end
    end
  end
end
