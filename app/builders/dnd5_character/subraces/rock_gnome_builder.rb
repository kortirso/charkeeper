# frozen_string_literal: true

module Dnd5Character
  module Subraces
    class RockGnomeBuilder
      TOOLS = %w[tinker].freeze

      def call(result:)
        result[:tools] = result[:tools].concat(TOOLS).uniq

        result
      end
    end
  end
end
