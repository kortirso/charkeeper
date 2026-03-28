# frozen_string_literal: true

module Dnd2024Character
  module Backgrounds
    class CustomBuilder
      def call(result:)
        record = Dnd2024::Homebrew::Background.find_by(id: result[:background])
        return result unless record

        result[:selected_feats] = record.data.selected_feats
        result[:selected_skills] = record.data.selected_skills
        result[:ability_boosts] = record.data.ability_boosts

        result
      end
    end
  end
end
