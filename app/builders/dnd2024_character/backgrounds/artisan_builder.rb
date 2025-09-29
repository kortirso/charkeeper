# frozen_string_literal: true

module Dnd2024Character
  module Backgrounds
    class ArtisanBuilder
      def call(result:)
        result[:selected_feats] = ['crafter']
        result[:selected_skills] = { investigation: 1, persuation: 1 }

        result
      end
    end
  end
end
