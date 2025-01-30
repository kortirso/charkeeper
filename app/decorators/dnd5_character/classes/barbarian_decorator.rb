# frozen_string_literal: true

module Dnd5Character
  module Classes
    class BarbarianDecorator
      WEAPON_CORE = ['light weapon', 'martial weapon'].freeze
      ARMOR = ['light armor', 'medium armor', 'shield'].freeze

      def decorate_fresh_character(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE)
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR)

        result
      end

      def decorate_character_abilities(result:, class_level:)
        result[:class_save_dc] = %i[str con] if result[:main_class] == 'barbarian'
        result[:combat][:speed] += speed_modifier(class_level)
        if result.dig(:defense_gear, :armor).nil?
          result[:combat][:armor_class] = [result[:combat][:armor_class], barbarian_armor_class(result)].max
        end

        result
      end

      private

      def speed_modifier(class_level)
        class_level >= 5 ? 10 : 5
      end

      def barbarian_armor_class(result)
        10 +
          result.dig(:modifiers, :dex) +
          result.dig(:modifiers, :con) +
          result.dig(:defense_gear, :shield, :items_data, 'info', 'ac').to_i
      end
    end
  end
end
