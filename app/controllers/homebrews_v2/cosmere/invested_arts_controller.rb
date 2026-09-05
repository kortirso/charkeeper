# frozen_string_literal: true

module HomebrewsV2
  module Cosmere
    class InvestedArtsController < HomebrewsV2::HomebrewController
      include SerializeResource

      private

      def class_name = ::Cosmere::Homebrews::InvestedArt
      def serializer = ::HomebrewsV2::Cosmere::InvestedArtSerializer
      def feat_class = ::Cosmere::Feat
      def character_class = ::Cosmere::Character

      def find_existing_characters
        @kept = false
      end
    end
  end
end
