# frozen_string_literal: true

module Dnd5Character
  module Races
    class DwarfDecorator
      DEFAULT_WEAPON_SKILLS = ['Handaxe', 'Battleaxe', 'Light hammer', 'Warhammer'].freeze
      LANGUAGES = %w[common dwarvish].freeze

      def decorate_fresh_character(result:)
        result[:speed] = 25
        result[:languages] = result[:languages].concat(LANGUAGES)
        result[:weapon_skills] = result[:weapon_skills].concat(DEFAULT_WEAPON_SKILLS)

        result
      end
    end
  end
end
