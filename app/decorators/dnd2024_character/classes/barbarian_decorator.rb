# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class BarbarianDecorator
      WEAPON_CORE = ['light weapon', 'martial weapon'].freeze
      ARMOR = ['light armor', 'medium armor', 'shield'].freeze

      def decorate_fresh_character(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:abilities] = { str: 15, dex: 13, con: 14, int: 10, wis: 11, cha: 12 }
        result[:health] = { current: 14, max: 14, temp: 0 }

        result
      end

      def decorate_character_abilities(result:, class_level:) # rubocop: disable Lint/UnusedMethodArgument
        result[:class_save_dc] = %i[str con] if result[:main_class] == 'barbarian'
        if result.dig(:defense_gear, :armor).nil?
          result[:combat][:armor_class] = [result[:combat][:armor_class], barbarian_armor_class(result)].max
        end

        result
      end

      private

      def barbarian_armor_class(result)
        10 +
          result.dig(:modifiers, :dex) +
          result.dig(:modifiers, :con) +
          result.dig(:defense_gear, :shield, :items_data, 'info', 'ac').to_i
      end
    end
  end
end
