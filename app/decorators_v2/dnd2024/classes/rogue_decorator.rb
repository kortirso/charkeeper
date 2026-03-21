# frozen_string_literal: true

module Dnd2024
  module Classes
    class RogueDecorator < ApplicationDecoratorV2
      CLASS_SAVE_DC = %w[dex int].freeze
      EXTENDED_CLASS_SAVE_DC = %w[dex int wis cha].freeze

      def call(result:)
        @result = result
        @result['class_save_dc'] = class_save_dc if main_class == 'rogue'
        @result['spell_classes']['rogue'] = { multiclass_spell_level: 0 }
        @result['spells_slots'] = { 1 => 0 }
        @result
      end

      private

      def class_save_dc
        classes['rogue'] >= 15 ? EXTENDED_CLASS_SAVE_DC : CLASS_SAVE_DC
      end
    end
  end
end
