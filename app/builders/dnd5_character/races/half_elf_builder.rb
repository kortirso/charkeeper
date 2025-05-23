# frozen_string_literal: true

module Dnd5Character
  module Races
    class HalfElfBuilder
      LANGUAGES = %w[common elvish].freeze

      def call(result:)
        result[:speed] = 30
        result[:languages] = result[:languages].concat(LANGUAGES).uniq

        result
      end
    end
  end
end
