# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class MonkDecorator
      WEAPON_CORE = ['light weapon'].freeze

      def decorate_fresh_character(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:abilities] = { str: 12, dex: 15, con: 13, int: 11, wis: 14, cha: 10 }
        result[:health] = { current: 9, max: 9, temp: 0 }

        result
      end

      # rubocop: disable Metrics/AbcSize
      def decorate_character_abilities(result:, class_level:)
        result[:class_save_dc] = %i[str dex] if result[:main_class] == 'monk'
        result[:hit_dice][8] += class_level

        no_armor = result[:defense_gear].values.all?(&:nil?)
        result[:combat][:speed] += speed_modifier(class_level) if no_armor
        result[:combat][:armor_class] = [result[:combat][:armor_class], monk_armor_class(result)].max if no_armor

        result
      end
      # rubocop: enable Metrics/AbcSize

      private

      def speed_modifier(class_level)
        return 0 if class_level < 2

        (((class_level + 2) / 4) + 1) * 5
      end

      def monk_armor_class(result)
        10 + result.dig(:modifiers, :dex) + result.dig(:modifiers, :wis)
      end
    end
  end
end
