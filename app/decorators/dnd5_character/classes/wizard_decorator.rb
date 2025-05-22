# frozen_string_literal: true

module Dnd5Character
  module Classes
    class WizardDecorator < ApplicationDecorator
      CLASS_SAVE_DC = %w[int wis].freeze

      def class_save_dc
        @class_save_dc ||= main_class == 'wizard' ? CLASS_SAVE_DC : __getobj__.class_save_dc
      end

      # rubocop: disable Metrics/AbcSize
      def spell_classes
        @spell_classes ||= begin
          result = __getobj__.spell_classes
          result[:wizard] = {
            save_dc: 8 + proficiency_bonus + modifiers['int'],
            attack_bonus: proficiency_bonus + modifiers['int'],
            cantrips_amount: cantrips_amount,
            max_spell_level: max_spell_level,
            prepared_spells_amount: [modifiers['int'] + class_level, 1].max,
            multiclass_spell_level: class_level # full level
          }
          result
        end
      end
      # rubocop: enable Metrics/AbcSize

      def spells_slots
        @spells_slots ||= ::Dnd5Character::ClassDecorateWrapper::SPELL_SLOTS[class_level]
      end

      private

      def class_level
        @class_level ||= classes['wizard']
      end

      def cantrips_amount
        return 5 if class_level >= 10
        return 4 if class_level >= 4

        3
      end

      def max_spell_level
        ::Dnd5Character::ClassDecorateWrapper::SPELL_SLOTS[class_level].keys.max
      end
    end
  end
end
