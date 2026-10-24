# frozen_string_literal: true

module HomebrewsV2
  module Pathfinder2
    class SubracesController < HomebrewsV2::HomebrewController
      include SerializeResource

      private

      def class_name = ::Pathfinder2::Homebrews::Subrace
      def serializer = ::HomebrewsV2::Pathfinder2::SubraceSerializer
      def feat_class = ::Pathfinder2::Feat
      def character_class = ::Pathfinder2::Character

      def find_existing_characters
        return unless characters_relation.exists?(["data ->> 'subrace' = ?", @element.id])

        @kept = true
      end
    end
  end
end
