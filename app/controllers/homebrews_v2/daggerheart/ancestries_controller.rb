# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class AncestriesController < HomebrewsV2::HomebrewController
      include SerializeResource

      private

      def class_name = ::Daggerheart::Homebrews::Ancestry
      def serializer = ::HomebrewsV2::Daggerheart::AncestrySerializer

      def copy_command
        HomebrewsV2Context::Import::Daggerheart::Ancestries::CopyCommand.new.call({
          ancestry: @element, user: current_user
        })
      end

      def find_existing_characters
        return unless characters_relation.exists?(["data ->> 'heritage' = ?", @element.id])

        @kept = true
      end
    end
  end
end
