# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class RogueDecorator < ApplicationDecorator
      CLASS_SAVE_DC = %w[dex int].freeze
      EXTENDED_CLASS_SAVE_DC = %w[dex int wis cha].freeze

      def class_save_dc
        @class_save_dc ||=
          if main_class == 'rogue'
            class_level >= 15 ? EXTENDED_CLASS_SAVE_DC : CLASS_SAVE_DC
          else
            __getobj__.class_save_dc
          end
      end

      def spell_classes
        @spell_classes ||= begin
          result = __getobj__.spell_classes
          result[:rogue] = { multiclass_spell_level: 0 }
          result
        end
      end

      def spells_slots
        @spells_slots ||= ::Dnd2024Character::ClassDecorateWrapper::EMPTY_SPELL_SLOTS[class_level]
      end

      private

      def class_level
        @class_level ||= classes['rogue']
      end
    end
  end
end
