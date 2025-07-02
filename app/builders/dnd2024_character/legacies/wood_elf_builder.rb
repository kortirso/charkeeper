# frozen_string_literal: true

module Dnd2024Character
  module Legacies
    class WoodElfBuilder
      def call(result:)
        result[:speed] = 35

        result
      end
    end
  end
end
