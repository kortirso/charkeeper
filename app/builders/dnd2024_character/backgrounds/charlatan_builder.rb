# frozen_string_literal: true

module Dnd2024Character
  module Backgrounds
    class CharlatanBuilder
      def call(result:)
        result[:selected_skills] = { deception: 1, sleight: 1 }
        result[:ability_boosts] = %w[dex con cha]
        result[:any_skill_boosts] += 3

        result
      end
    end
  end
end
