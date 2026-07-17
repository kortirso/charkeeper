# frozen_string_literal: true

module HomebrewsV2
  module Dnd2024
    class FeatsController < HomebrewsV2::FeatsController
      private

      def serializer = ::HomebrewsV2::Dnd2024::FeatSerializer
      def class_name = ::Dnd2024::Feat

      def find_feats
        @feats =
          class_name.where(user_id: current_user.id).or(class_name.where(public: true))
            .where(origin: 'feat')
            .includes(:homebrew_books)
      end

      def order_options
        { key: %w[title] }
      end
    end
  end
end
