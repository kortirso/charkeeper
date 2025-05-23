# frozen_string_literal: true

module Dnd2024Character
  module Species
    class DwarfBuilder
      RESISTANCES = %w[poison].freeze

      def call(result:)
        result[:speed] = 30
        result[:resistance] = result[:resistance].concat(RESISTANCES).uniq

        result
      end
    end
  end
end
