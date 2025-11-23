# frozen_string_literal: true

module Dnd2024Character
  module Backgrounds
    class SoldierBuilder
      def call(result:)
        result[:selected_feats] = ['savage_attacker']
        result[:selected_skills] = { athletics: 1, intimidation: 1 }
        result[:ability_boosts] = %w[str dex con]

        result
      end
    end
  end
end
