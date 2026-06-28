# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class TransformationsController < HomebrewsV2::HomebrewController
      include SerializeResource

      private

      def class_name = ::Daggerheart::Homebrews::Transformation
      def serializer = ::HomebrewsV2::Daggerheart::TransformationSerializer

      def copy_command
        HomebrewsV2Context::Import::Daggerheart::Transformations::CopyCommand.new.call({
          transformation: @element, user: current_user
        })
      end

      def find_existing_characters
        return unless characters_relation.exists?(["data ->> 'transformation' = ?", @element.id])

        @kept = true
      end
    end
  end
end
