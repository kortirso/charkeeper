# frozen_string_literal: true

module Dnd2024Character
  module Backgrounds
    class NobleBuilder
      def call(result:)
        result[:selected_skills] = { history: 1, persuation: 1 }

        result
      end
    end
  end
end
