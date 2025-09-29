# frozen_string_literal: true

module Dnd2024Character
  module Backgrounds
    class AcolyteBuilder
      def call(result:)
        result[:selected_feats] = ['cleric_magic_initiate']
        result[:selected_skills] = { insight: 1, religion: 1 }

        result
      end
    end
  end
end
