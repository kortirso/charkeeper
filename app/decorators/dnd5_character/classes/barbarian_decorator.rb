# frozen_string_literal: true

module Dnd5Character
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

      # rubocop: disable Metrics/AbcSize
      def decorate_character_abilities(result:, class_level:)
        result[:class_save_dc] = %i[str con] if result[:main_class] == 'barbarian'
        result[:combat][:speed] += speed_modifier(class_level)
        if result.dig(:defense_gear, :armor).nil?
          result[:combat][:armor_class] = [result[:combat][:armor_class], barbarian_armor_class(result)].max
        end
        result[:hit_dice][12] += class_level

        result[:combat][:attacks_per_action] = 2 if class_level >= 5 # Extra Attack, 5 level

        result
      end
      # rubocop: enable Metrics/AbcSize

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
