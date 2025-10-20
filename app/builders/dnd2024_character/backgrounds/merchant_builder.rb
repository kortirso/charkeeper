# frozen_string_literal: true

module Dnd2024Character
  module Backgrounds
    class MerchantBuilder
      def call(result:)
        result[:selected_feats] = ['lucky']
        result[:selected_skills] = { animal: 1, persuasion: 1 }

        result
      end
    end
  end
end
