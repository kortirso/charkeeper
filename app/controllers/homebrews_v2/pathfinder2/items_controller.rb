# frozen_string_literal: true

module HomebrewsV2
  module Pathfinder2
    class ItemsController < HomebrewsV2::ItemsController
      private

      def serializer = ::HomebrewsV2::ListItemSerializer
      def show_serializer = ::HomebrewsV2::Pathfinder2::ItemSerializer
      def class_name = ::Pathfinder2::Item

      def items
        class_name.where(user_id: current_user.id).or(class_name.where(public: true))
          .visible
          .kept
          .where(kind: params.expect(:type).split(','))
          .includes(:homebrew_books)
      end
    end
  end
end
