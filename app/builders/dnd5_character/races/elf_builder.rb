# frozen_string_literal: true

module Dnd5Character
  module Races
    class ElfBuilder
      DEFAULT_SELECTED_SKILLS = %w[perception].freeze
      LANGUAGES = %w[common elvish].freeze

      def call(result:)
        result[:speed] = 30
        result[:languages] = result[:languages].concat(LANGUAGES).uniq
        result[:selected_skills] = result[:selected_skills].concat(DEFAULT_SELECTED_SKILLS).uniq

        result
      end
    end
  end
end
