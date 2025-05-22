# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class MonkDecorator < ApplicationDecorator
      CLASS_SAVE_DC = %w[str dex].freeze

      def class_save_dc
        @class_save_dc ||= main_class == 'monk' ? CLASS_SAVE_DC : __getobj__.class_save_dc
      end

      def speed
        @speed ||= no_armor ? (__getobj__.speed + speed_modifier) : __getobj__.speed
      end

      def armor_class
        @armor_class ||= no_armor ? [__getobj__.armor_class, monk_armor_class].max : __getobj__.armor_class
      end

      private

      def class_level
        @class_level ||= classes['monk']
      end

      def speed_modifier
        return 0 if class_level < 2

        (((class_level + 2) / 4) + 1) * 5
      end

      def monk_armor_class
        10 + modifiers['dex'] + modifiers['wis']
      end

      def no_armor
        @no_armor ||= defense_gear.values.all?(&:nil?)
      end
    end
  end
end
