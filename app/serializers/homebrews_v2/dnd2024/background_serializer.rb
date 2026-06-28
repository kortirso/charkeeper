# frozen_string_literal: true

module HomebrewsV2
  module Dnd2024
    class BackgroundSerializer < ApplicationSerializer
      attributes :id, :ability_boosts, :selected_skills, :selected_feat

      def ability_boosts
        object.info['ability_boosts']
      end

      def selected_skills
        object.info['selected_skills']
      end

      def selected_feat
        translate(::Dnd2024::Feat.find_by(id: object.info['selected_feats'])&.title)
      end
    end
  end
end
