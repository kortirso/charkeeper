# frozen_string_literal: true

module HomebrewsV2
  module Cosmere
    class InvestedPathsController < HomebrewsV2::HomebrewController
      include SerializeResource

      private

      def class_name = ::Cosmere::Homebrews::InvestedPath
      def serializer = ::HomebrewsV2::Cosmere::InvestedPathSerializer
      def feat_class = ::Cosmere::Feat
      def character_class = ::Cosmere::Character

      def find_existing_characters
        @kept = false
      end
    end
  end
end
