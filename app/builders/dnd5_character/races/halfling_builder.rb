# frozen_string_literal: true

module Dnd5Character
  module Races
    class HalflingBuilder
      LANGUAGES = %w[common halfling].freeze

      def call(result:)
        result[:speed] = 25
        result[:languages] = result[:languages].concat(LANGUAGES).uniq

        result
      end
    end
  end
end
