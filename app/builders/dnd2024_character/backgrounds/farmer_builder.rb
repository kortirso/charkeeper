# frozen_string_literal: true

module Dnd2024Character
  module Backgrounds
    class FarmerBuilder
      def call(result:)
        result[:selected_feats] = ['tough']
        result[:selected_skills] = { animal: 1, nature: 1 }
        result[:ability_boosts] = %w[str con wis]
        result[:tools] = result[:tools].push('carpenter').uniq

        result
      end
    end
  end
end
