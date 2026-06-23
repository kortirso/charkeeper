# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class CommunitiesController < HomebrewsV2::Daggerheart::ElementsController
      include SerializeResource

      private

      def class_name = ::Daggerheart::Homebrews::Community
      def serializer = ::HomebrewsV2::Daggerheart::CommunitySerializer

      def copy_command
        HomebrewsV2Context::Import::Daggerheart::Communities::CopyCommand.new.call({
          community: @element, user: current_user
        })
      end

      def find_existing_characters
        return unless characters_relation.exists?(["data ->> 'community' = ?", @element.id])

        @kept = true
      end
    end
  end
end
