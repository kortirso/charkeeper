# frozen_string_literal: true

module Dnd5Character
  module Races
    class HumanDecorator
      LANGUAGES = %w[common].freeze

      def decorate_fresh_character(result:)
        result[:speed] = 30
        result[:languages] = result[:languages].concat(LANGUAGES).uniq

        result
      end

      def decorate_character_abilities(result:)
        result
      end
    end
  end
end
