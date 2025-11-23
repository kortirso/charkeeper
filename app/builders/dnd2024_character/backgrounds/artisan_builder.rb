# frozen_string_literal: true

module Dnd2024Character
  module Backgrounds
    class ArtisanBuilder
      def call(result:)
        result[:selected_feats] = ['crafter']
        result[:selected_skills] = { investigation: 1, persuasion: 1 }
        result[:ability_boosts] = %w[str dex int]

        result
      end
    end
  end
end
