# frozen_string_literal: true

module Dnd5Character
  module Classes
    class BarbarianDecorator
      def decorate(result:, class_level:)
        result[:class_save_dc] = %i[str con] if result[:main_class] == 'barbarian'
        result[:combat][:speed] += speed_modifier(class_level)
        if result.dig(:defense, :armor).nil?
          result[:combat][:armor_class] = [result[:combat][:armor_class], barbarian_armor_class(result)].max
        end

        result
      end

      private

      def speed_modifier(class_level)
        class_level >= 5 ? 10 : 5
      end

      def barbarian_armor_class(result)
        10 + result.dig(:modifiers, :dex) + result.dig(:modifiers, :con) + result.dig(:defense, :shield, :items_data, 'ac').to_i
      end
    end
  end
end
