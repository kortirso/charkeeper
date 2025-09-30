# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class FighterDecorator < ApplicationDecorator
      CLASS_SAVE_DC = %w[str con].freeze

      def class_save_dc
        @class_save_dc ||= main_class == 'fighter' ? CLASS_SAVE_DC : __getobj__.class_save_dc
      end

      def spell_classes
        @spell_classes ||= begin
          result = __getobj__.spell_classes
          result[:fighter] = { multiclass_spell_level: 0 }
          result
        end
      end

      def spells_slots
        @spells_slots ||= ::Dnd2024Character::ClassDecorateWrapper::EMPTY_SPELL_SLOTS[class_level]
      end
    end
  end
end
