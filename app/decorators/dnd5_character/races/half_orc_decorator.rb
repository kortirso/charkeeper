# frozen_string_literal: true

module Dnd5Character
  module Races
    class HalfOrcDecorator
      DEFAULT_SELECTED_SKILLS = %w[intimidation].freeze
      LANGUAGES = %w[common orc].freeze

      def decorate_fresh_character(result:)
        result[:speed] = 30
        result[:languages] = result[:languages].concat(LANGUAGES)
        result[:selected_skills] = result[:selected_skills].concat(DEFAULT_SELECTED_SKILLS)

        result
      end
    end
  end
end
