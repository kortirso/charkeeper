# frozen_string_literal: true

module HomebrewsV2
  module Cosmere
    class SettingsController < HomebrewsV2::HomebrewController
      include SerializeResource

      private

      def class_name = ::Cosmere::Homebrews::Setting
      def serializer = ::HomebrewsV2::Cosmere::SettingSerializer
      def character_class = ::Cosmere::Character

      def find_features = []

      def find_existing_characters
        return unless characters_relation.exists?(["data ->> 'setting' = ?", @element.id])

        @kept = true
      end
    end
  end
end
