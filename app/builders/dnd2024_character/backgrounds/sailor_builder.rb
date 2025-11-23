# frozen_string_literal: true

module Dnd2024Character
  module Backgrounds
    class SailorBuilder
      def call(result:)
        result[:selected_feats] = ['tavern_brawler']
        result[:selected_skills] = { acrobatics: 1, perception: 1 }
        result[:ability_boosts] = %w[str dex wis]

        result
      end
    end
  end
end
