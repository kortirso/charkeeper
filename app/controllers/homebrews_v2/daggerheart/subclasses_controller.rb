# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class SubclassesController < HomebrewsV2::Daggerheart::ElementsController
      include SerializeResource

      private

      def class_name = ::Daggerheart::Homebrews::Subclass
      def serializer = ::HomebrewsV2::Daggerheart::SubclassSerializer

      def copy_command
        HomebrewsV2Context::Import::Daggerheart::Subclasses::CopyCommand.new.call({
          subclass: @element, user: current_user
        })
      end

      def find_existing_characters
        subclasses = ::Daggerheart::Character.pluck(:data).pluck(:subclasses)
        return if subclasses.flat_map(&:values).exclude?(@element.id)

        @kept = true
      end
    end
  end
end
