# frozen_string_literal: true

module Dnd2024Character
  module Backgrounds
    class WayfarerBuilder
      def call(result:)
        result[:selected_feats] = ['lucky']
        result[:selected_skills] = { insight: 1, stealth: 1 }
        result[:ability_boosts] = %w[dex wis cha]

        result
      end
    end
  end
end
