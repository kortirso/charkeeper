# frozen_string_literal: true

module Dnd5Character
  module Races
    class DwarfBuilder
      DEFAULT_WEAPON_SKILLS = %w[handaxe battleaxe light_hammer warhammer].freeze
      LANGUAGES = %w[common dwarvish].freeze
      RESISTANCES = %w[poison].freeze

      def call(result:)
        result[:speed] = 25
        result[:languages] = result[:languages].concat(LANGUAGES).uniq
        result[:weapon_skills] = result[:weapon_skills].concat(DEFAULT_WEAPON_SKILLS).uniq
        result[:resistance] = result[:resistance].concat(RESISTANCES).uniq

        result
      end
    end
  end
end
