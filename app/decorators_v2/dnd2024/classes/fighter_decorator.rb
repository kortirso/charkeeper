# frozen_string_literal: true

module Dnd2024
  module Classes
    class FighterDecorator < ApplicationDecoratorV2
      CLASS_SAVE_DC = %w[str con].freeze

      def call(result:)
        @result = result
        @result['class_save_dc'] = CLASS_SAVE_DC if main_class == 'fighter'
        @result['spell_classes']['fighter'] = { multiclass_spell_level: 0 }
        @result['spells_slots'] = { 1 => 0 }
        find_static_spells
        @result
      end
    end
  end
end
