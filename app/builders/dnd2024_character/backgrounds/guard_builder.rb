# frozen_string_literal: true

module Dnd2024Character
  module Backgrounds
    class GuardBuilder
      def call(result:)
        result[:selected_feats] = ['alert']
        result[:selected_skills] = { athletics: 1, perception: 1 }
        result[:ability_boosts] = %w[str int wis]

        result
      end
    end
  end
end
