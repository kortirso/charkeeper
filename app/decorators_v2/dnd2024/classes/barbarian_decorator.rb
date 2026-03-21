# frozen_string_literal: true

module Dnd2024
  module Classes
    class BarbarianDecorator < ApplicationDecoratorV2
      CLASS_SAVE_DC = %w[str con].freeze

      def call(result:)
        @result = result
        @result['class_save_dc'] = CLASS_SAVE_DC if main_class == 'barbarian'
        @result['spell_classes']['barbarian'] = { multiclass_spell_level: 0 }
        @result['spells_slots'] = { 1 => 0 }
        @result['speed'] = speed + speed_modifier
        @result['armor_class'] = [armor_class, barbarian_armor_class].max if no_body_armor.nil?
        @result
      end

      private

      def class_level
        @class_level ||= classes['barbarian']
      end

      def speed_modifier
        class_level >= 5 ? 10 : 0
      end

      def barbarian_armor_class
        10 + modifiers['dex'] + modifiers['con'] + defense_gear.dig(:shield, :items_info, 'ac').to_i
      end
    end
  end
end
