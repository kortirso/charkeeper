# frozen_string_literal: true

module HomebrewsV2
  module Dnd2024
    class BackgroundsController < HomebrewsV2::HomebrewController
      include SerializeResource

      private

      def class_name = ::Dnd2024::Homebrews::Background
      def serializer = ::HomebrewsV2::Dnd2024::BackgroundSerializer

      def copy_command
        HomebrewsV2Context::Import::Dnd2024::Backgrounds::CopyCommand.new.call({
          background: @element, user: current_user
        })
      end

      def find_existing_characters
        return unless characters_relation.exists?(["data ->> 'background' = ?", @element.id])

        @kept = true
      end
    end
  end
end
