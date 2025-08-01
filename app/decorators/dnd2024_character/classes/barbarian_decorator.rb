# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class BarbarianDecorator < ApplicationDecorator
      CLASS_SAVE_DC = %w[str con].freeze

      def class_save_dc
        @class_save_dc ||= main_class == 'barbarian' ? CLASS_SAVE_DC : __getobj__.class_save_dc
      end

      def speed
        @speed ||= __getobj__.speed + speed_modifier
      end

      def armor_class
        @armor_class ||=
          defense_gear[:armor].nil? ? [__getobj__.armor_class, barbarian_armor_class].max : __getobj__.armor_class
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
