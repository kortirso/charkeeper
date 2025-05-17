# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class FighterDecorator
      WEAPON_CORE = ['light weapon', 'martial weapon'].freeze
      ARMOR = ['light armor', 'medium armor', 'heavy armor', 'shield'].freeze

      def decorate_fresh_character(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:abilities] = { str: 15, dex: 13, con: 14, int: 10, wis: 11, cha: 12 }
        result[:health] = { current: 12, max: 12, temp: 0 }

        result
      end

      def decorate_character_abilities(result:, class_level:) # rubocop: disable Lint/UnusedMethodArgument
        result[:class_save_dc] = %i[str con] if result[:main_class] == 'fighter'

        result
      end
    end
  end
end
