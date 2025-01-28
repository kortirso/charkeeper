# frozen_string_literal: true

module Dnd5NewCharacter
  module Races
    class HalflingDecorator
      LANGUAGES = %w[common halfling].freeze

      def decorate(result:)
        result[:speed] = 25
        result[:languages] = result[:languages].concat(LANGUAGES)

        result
      end
    end
  end
end
