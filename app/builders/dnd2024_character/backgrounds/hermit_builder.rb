# frozen_string_literal: true

module Dnd2024Character
  module Backgrounds
    class HermitBuilder
      def call(result:)
        result[:selected_feats] = ['healer']
        result[:selected_skills] = { medicine: 1, religion: 1 }
        result[:ability_boosts] = %w[con wis cha]
        result[:tools] = result[:tools].push('herbalism').uniq

        result
      end
    end
  end
end
