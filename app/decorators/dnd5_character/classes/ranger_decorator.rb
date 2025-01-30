# frozen_string_literal: true

module Dnd5Character
  module Classes
    class RangerDecorator
      WEAPON_CORE = ['light weapon', 'martial weapon'].freeze
      ARMOR = ['light armor', 'medium armor', 'shield'].freeze

      def decorate_fresh_character(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE)
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR)

        result
      end
    end
  end
end
