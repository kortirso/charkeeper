# frozen_string_literal: true

module Dnd2024Character
  module Backgrounds
    class EntertainerBuilder
      def call(result:)
        result[:selected_feats] = ['musician']
        result[:selected_skills] = { acrobatics: 1, performance: 1 }
        result[:ability_boosts] = %w[str dex cha]

        result
      end
    end
  end
end
