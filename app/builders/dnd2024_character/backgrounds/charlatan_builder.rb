# frozen_string_literal: true

module Dnd2024Character
  module Backgrounds
    class CharlatanBuilder
      def call(result:)
        result[:selected_feats] = ['skilled']
        result[:selected_skills] = { deception: 1, sleight: 1 }
        result[:ability_boosts] = %w[dex con cha]
        result[:tools] = result[:tools].push('forgery').uniq

        result
      end
    end
  end
end
