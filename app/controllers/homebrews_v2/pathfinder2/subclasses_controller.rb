# frozen_string_literal: true

module HomebrewsV2
  module Pathfinder2
    class SubclassesController < HomebrewsV2::HomebrewController
      include SerializeResource

      private

      def class_name = ::Pathfinder2::Homebrews::Subclass
      def serializer = ::HomebrewsV2::Pathfinder2::SubclassSerializer
      def feat_class = ::Pathfinder2::Feat
      def character_class = ::Pathfinder2::Character

      def find_existing_characters
        subclasses = character_class.pluck(:data).pluck(:subclasses)
        return if subclasses.flat_map(&:values).exclude?(@element.id)

        @kept = true
      end
    end
  end
end
