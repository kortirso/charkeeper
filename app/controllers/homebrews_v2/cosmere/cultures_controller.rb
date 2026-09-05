# frozen_string_literal: true

module HomebrewsV2
  module Cosmere
    class CulturesController < HomebrewsV2::HomebrewController
      include SerializeResource

      private

      def class_name = ::Cosmere::Homebrews::Culture
      def serializer = ::HomebrewsV2::Cosmere::CultureSerializer
      def character_class = ::Cosmere::Character

      def find_features = []

      def find_existing_characters
        @kept = true
      end
    end
  end
end
