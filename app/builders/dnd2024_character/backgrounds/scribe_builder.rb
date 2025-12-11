# frozen_string_literal: true

module Dnd2024Character
  module Backgrounds
    class ScribeBuilder
      def call(result:)
        result[:selected_feats] = ['skilled']
        result[:selected_skills] = { investigation: 1, perception: 1 }
        result[:ability_boosts] = %w[dex int wis]
        result[:tools] = result[:tools].push('calligrapher').uniq

        result
      end
    end
  end
end
