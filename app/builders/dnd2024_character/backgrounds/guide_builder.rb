# frozen_string_literal: true

module Dnd2024Character
  module Backgrounds
    class GuideBuilder
      def call(result:)
        result[:selected_feats] = ['druid_magic_initiate']
        result[:selected_skills] = { stealth: 1, survival: 1 }

        result
      end
    end
  end
end
