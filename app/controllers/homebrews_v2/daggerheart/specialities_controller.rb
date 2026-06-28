# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class SpecialitiesController < HomebrewsV2::HomebrewController
      include SerializeResource

      private

      def class_name = ::Daggerheart::Homebrews::Speciality
      def serializer = ::HomebrewsV2::Daggerheart::SpecialitySerializer

      def copy_command
        HomebrewsV2Context::Import::Daggerheart::Specialities::CopyCommand.new.call({
          speciality: @element, user: current_user
        })
      end

      def find_existing_characters
        subclasses = ::Daggerheart::Character.pluck(:data).pluck(:subclasses)
        return if subclasses.flat_map(&:keys).exclude?(@element.id)

        @kept = true
      end
    end
  end
end
