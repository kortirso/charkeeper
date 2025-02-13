# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class RogueDecorator
      WEAPON_CORE = ['light weapon'].freeze
      ARMOR = ['light armor'].freeze
      TOOLS = %w[thieves].freeze

      def decorate_fresh_character(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:tools] = result[:tools].concat(TOOLS).uniq
        result[:abilities] = { str: 11, dex: 15, con: 10, int: 14, wis: 12, cha: 13 }
        result[:health] = { current: 8, max: 8, temp: 0 }

        result
      end

      def decorate_character_abilities(result:, class_level:)
        result[:class_save_dc] = %i[dex int] if result[:main_class] == 'rogue'
        result[:hit_dice][8] += class_level

        result
      end
    end
  end
end
