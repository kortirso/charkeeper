# frozen_string_literal: true

module Dnd2024Character
  module Species
    class OrcBuilder
      def call(result:)
        result[:speed] = 30

        result
      end
    end
  end
end
