# frozen_string_literal: true

module Dnd2024Character
  module Backgrounds
    class CriminalBuilder
      def call(result:)
        result[:selected_feats] = ['alert']
        result[:selected_skills] = { sleight: 1, stealth: 1 }

        result
      end
    end
  end
end
