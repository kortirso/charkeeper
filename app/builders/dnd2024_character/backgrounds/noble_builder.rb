# frozen_string_literal: true

module Dnd2024Character
  module Backgrounds
    class NobleBuilder
      def call(result:)
        result[:selected_skills] = { history: 1, persuasion: 1 }
        result[:ability_boosts] = %w[str int cha]
        result[:any_skill_boosts] += 3

        result
      end
    end
  end
end
