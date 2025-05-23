# frozen_string_literal: true

module Dnd5Character
  module Subraces
    class StoutBuilder
      RESISTANCES = %w[poison].freeze

      def call(result:)
        result[:resistance] = result[:resistance].concat(RESISTANCES).uniq

        result
      end
    end
  end
end
