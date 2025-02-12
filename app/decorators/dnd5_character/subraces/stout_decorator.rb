# frozen_string_literal: true

module Dnd5Character
  module Subraces
    class StoutDecorator
      RESISTANCES = %w[poison].freeze

      def decorate_fresh_character(result:)
        result[:resistance] = result[:resistance].concat(RESISTANCES).uniq

        result
      end

      def decorate_character_abilities(result:)
        result
      end
    end
  end
end
