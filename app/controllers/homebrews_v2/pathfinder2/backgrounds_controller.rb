# frozen_string_literal: true

module HomebrewsV2
  module Pathfinder2
    class BackgroundsController < HomebrewsV2::HomebrewController
      include SerializeResource

      private

      def class_name = ::Pathfinder2::Homebrews::Background
      def serializer = ::HomebrewsV2::Pathfinder2::BackgroundSerializer
      def feat_class = ::Pathfinder2::Feat
      def character_class = ::Pathfinder2::Character

      def find_existing_characters
        return unless characters_relation.exists?(["data ->> 'background' = ?", @element.id])

        @kept = true
      end
    end
  end
end
