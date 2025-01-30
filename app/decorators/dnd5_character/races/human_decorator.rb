# frozen_string_literal: true

module Dnd5Character
  module Races
    class HumanDecorator
      LANGUAGES = %w[common].freeze

      def decorate_fresh_character(result:)
        result[:speed] = 30
        result[:languages] = result[:languages].concat(LANGUAGES)

        result
      end
    end
  end
end
