# frozen_string_literal: true

module HomebrewsV2
  module Dnd2024
    class RacesController < HomebrewsV2::HomebrewController
      include SerializeResource

      private

      def class_name = ::Dnd2024::Homebrews::Race
      def serializer = ::HomebrewsV2::Dnd2024::RaceSerializer
      def feat_class = ::Dnd2024::Feat
      def character_class = ::Dnd2024::Character

      def find_existing_characters
        return unless characters_relation.exists?(["data ->> 'species' = ?", @element.id])

        @kept = true
      end
    end
  end
end
