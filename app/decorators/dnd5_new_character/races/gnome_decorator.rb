# frozen_string_literal: true

module Dnd5NewCharacter
  module Races
    class GnomeDecorator
      LANGUAGES = %w[common gnomish].freeze

      def decorate(result:)
        result[:speed] = 25
        result[:languages] = result[:languages].concat(LANGUAGES)

        result
      end
    end
  end
end
