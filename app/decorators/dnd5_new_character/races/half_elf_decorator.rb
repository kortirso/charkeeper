# frozen_string_literal: true

module Dnd5NewCharacter
  module Races
    class HalfElfDecorator
      LANGUAGES = %w[common elvish].freeze

      def decorate(result:)
        result[:speed] = 30
        result[:languages] = result[:languages].concat(LANGUAGES)

        result
      end
    end
  end
end
