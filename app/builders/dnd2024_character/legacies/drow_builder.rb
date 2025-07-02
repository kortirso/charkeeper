# frozen_string_literal: true

module Dnd2024Character
  module Legacies
    class DrowBuilder
      def call(result:)
        result[:darkvision] = 120

        result
      end
    end
  end
end
