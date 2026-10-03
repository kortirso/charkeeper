# frozen_string_literal: true

module HomebrewsV2
  module Dnd2024
    class SpecialitiesController < HomebrewsV2::HomebrewController
      include SerializeResource

      private

      def class_name = ::Dnd2024::Homebrews::Speciality
      def serializer = ::HomebrewsV2::Dnd2024::SpecialitySerializer
      def feat_class = ::Dnd2024::Feat
      def character_class = ::Dnd2024::Character

      def find_existing_characters
        subclasses = character_class.pluck(:data).pluck(:subclasses)
        return if subclasses.flat_map(&:keys).exclude?(@element.id)

        @kept = true
      end
    end
  end
end
