# frozen_string_literal: true

module Dnd2024Character
  module Backgrounds
    class SageBuilder
      def call(result:)
        result[:selected_feats] = ['wizard_magic_initiate']
        result[:selected_skills] = { arcana: 1, history: 1 }

        result
      end
    end
  end
end
