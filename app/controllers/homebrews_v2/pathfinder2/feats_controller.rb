# frozen_string_literal: true

module HomebrewsV2
  module Pathfinder2
    class FeatsController < HomebrewsV2::FeatsController
      private

      def serializer = ::HomebrewsV2::Pathfinder2::FeatSerializer
      def class_name = ::Pathfinder2::Feat

      def find_feats
        @feats =
          class_name.where(user_id: current_user.id).or(class_name.where(public: true))
            .where(origin: %w[general skill])
            .includes(:homebrew_books)
      end

      def order_options
        { key: %w[title] }
      end
    end
  end
end
