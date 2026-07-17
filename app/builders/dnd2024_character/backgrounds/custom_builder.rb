# frozen_string_literal: true

module Dnd2024Character
  module Backgrounds
    class CustomBuilder
      def call(result:)
        record = Dnd2024::Homebrews::Background.find_by(id: result[:background])
        return result unless record

        result[:selected_feats] = record.info.selected_feats
        result[:selected_skills] = record.info.selected_skills
        result[:ability_boosts] = record.info.ability_boosts

        result
      end
    end
  end
end
