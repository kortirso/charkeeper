# frozen_string_literal: true

module Dnd5NewCharacter
  module Races
    class TieflingDecorator
      LANGUAGES = %w[common infernal].freeze

      def decorate(result:)
        result[:speed] = 30
        result[:languages] = result[:languages].concat(LANGUAGES)

        result
      end
    end
  end
end
