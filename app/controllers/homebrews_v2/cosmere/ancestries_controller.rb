# frozen_string_literal: true

module HomebrewsV2
  module Cosmere
    class AncestriesController < HomebrewsV2::HomebrewController
      include SerializeResource

      private

      def class_name = ::Cosmere::Homebrews::Ancestry
      def serializer = ::HomebrewsV2::Cosmere::AncestrySerializer
      def feat_class = ::Cosmere::Feat
      def character_class = ::Cosmere::Character

      def find_existing_characters
        return unless characters_relation.exists?(["data ->> 'ancestry' = ?", @element.id])

        @kept = true
      end
    end
  end
end
