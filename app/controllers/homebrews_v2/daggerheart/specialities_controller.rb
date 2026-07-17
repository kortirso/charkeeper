# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class SpecialitiesController < HomebrewsV2::HomebrewController
      include SerializeResource

      private

      def class_name = ::Daggerheart::Homebrews::Speciality
      def serializer = ::HomebrewsV2::Daggerheart::SpecialitySerializer
      def feat_class = ::Daggerheart::Feat
      def character_class = ::Daggerheart::Character

      def find_existing_characters
        subclasses = character_class.pluck(:data).pluck(:subclasses)
        return if subclasses.flat_map(&:keys).exclude?(@element.id)

        @kept = true
      end
    end
  end
end
