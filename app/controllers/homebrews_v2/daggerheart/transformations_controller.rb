# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class TransformationsController < HomebrewsV2::HomebrewController
      include SerializeResource

      private

      def class_name = ::Daggerheart::Homebrews::Transformation
      def serializer = ::HomebrewsV2::Daggerheart::TransformationSerializer
      def feat_class = ::Daggerheart::Feat
      def character_class = ::Daggerheart::Character

      def find_existing_characters
        return unless characters_relation.exists?(["data ->> 'transformation' = ?", @element.id])

        @kept = true
      end
    end
  end
end
