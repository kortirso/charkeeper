# frozen_string_literal: true

module Dnd2024Character
  module Backgrounds
    class ScribeBuilder
      def call(result:)
        result[:selected_skills] = { investigation: 1, perception: 1 }

        result
      end
    end
  end
end
