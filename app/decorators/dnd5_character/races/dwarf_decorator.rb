# frozen_string_literal: true

module Dnd5Character
  module Races
    class DwarfDecorator
      DEFAULT_WEAPON_SKILLS = %w[handaxe battleaxe light_hammer warhammer].freeze
      LANGUAGES = %w[common dwarvish].freeze
      RESISTANCES = %w[poison].freeze

      def decorate_fresh_character(result:)
        result[:speed] = 25
        result[:languages] = result[:languages].concat(LANGUAGES).uniq
        result[:weapon_skills] = result[:weapon_skills].concat(DEFAULT_WEAPON_SKILLS).uniq
        result[:resistance] = result[:resistance].concat(RESISTANCES).uniq

        result
      end

      def decorate_character_abilities(result:)
        result[:darkvision] = 60

        result
      end
    end
  end
end
