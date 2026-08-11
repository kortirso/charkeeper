# frozen_string_literal: true

module HomebrewsV2
  module Nimble
    class AncestriesController < HomebrewsV2::HomebrewController
      include SerializeResource

      private

      def class_name = ::Nimble::Homebrews::Ancestry
      def serializer = ::HomebrewsV2::Nimble::AncestrySerializer
      def feat_class = ::Nimble::Feat
      def character_class = ::Nimble::Character

      def find_existing_characters
        return unless characters_relation.exists?(["data ->> 'ancestry' = ?", @element.id])

        @kept = true
      end
    end
  end
end
