# frozen_string_literal: true

module Dnd5Character
  module Subraces
    class RockGnomeDecorator
      TOOLS = %w[tinker].freeze

      def decorate_fresh_character(result:)
        result[:tools] = result[:tools].concat(TOOLS).uniq

        result
      end

      def decorate_character_abilities(result:)
        result
      end
    end
  end
end
