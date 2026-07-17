# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class SubclassesController < HomebrewsV2::HomebrewController
      include SerializeResource

      private

      def class_name = ::Daggerheart::Homebrews::Subclass
      def serializer = ::HomebrewsV2::Daggerheart::SubclassSerializer
      def feat_class = ::Daggerheart::Feat
      def character_class = ::Daggerheart::Character

      def find_existing_characters
        subclasses = character_class.pluck(:data).pluck(:subclasses)
        return if subclasses.flat_map(&:values).exclude?(@element.id)

        @kept = true
      end
    end
  end
end
