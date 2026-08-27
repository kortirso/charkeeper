# frozen_string_literal: true

module HomebrewsV2
  module Dnd2024
    class ItemsController < HomebrewsV2::ItemsController
      private

      def serializer = ::HomebrewsV2::ListItemSerializer
      def show_serializer = ::HomebrewsV2::Dnd2024::ItemSerializer
      def class_name = ::Dnd5::Item

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
