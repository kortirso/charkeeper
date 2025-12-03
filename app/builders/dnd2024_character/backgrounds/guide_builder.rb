# frozen_string_literal: true

module Dnd2024Character
  module Backgrounds
    class GuideBuilder
      def call(result:)
        result[:selected_feats] = ['druid_magic_initiate']
        result[:selected_skills] = { stealth: 1, survival: 1 }
        result[:ability_boosts] = %w[dex con wis]
        result[:tools] = result[:tools].push('cartographer').uniq

        result
      end
    end
  end
end
