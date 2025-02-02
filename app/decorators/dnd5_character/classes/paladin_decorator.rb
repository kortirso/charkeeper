# frozen_string_literal: true

module Dnd5Character
  module Classes
    class PaladinDecorator
      WEAPON_CORE = ['light weapon', 'martial weapon'].freeze
      ARMOR = ['light armor', 'medium armor', 'heavy armor', 'shield'].freeze

      def decorate_fresh_character(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq

        result
      end

      def decorate_character_abilities(result:, class_level:) # rubocop: disable Lint/UnusedMethodArgument
        result[:class_save_dc] = %i[wis cha] if result[:main_class] == 'paladin'

        result
      end
    end
  end
end
