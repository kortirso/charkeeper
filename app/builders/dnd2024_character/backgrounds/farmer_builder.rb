# frozen_string_literal: true

module Dnd2024Character
  module Backgrounds
    class FarmerBuilder
      def call(result:)
        result[:selected_skills] = { animal: 1, nature: 1 }

        result
      end
    end
  end
end
