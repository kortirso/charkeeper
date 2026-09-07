# frozen_string_literal: true

module HomebrewsV2
  module Cosmere
    class ItemsController < HomebrewsV2::ItemsController
      private

      def serializer = ::HomebrewsV2::ListItemSerializer
      def show_serializer = ::HomebrewsV2::Cosmere::ItemSerializer
      def class_name = ::Cosmere::Item

      def items
        class_name.where(user_id: current_user.id).or(class_name.where(public: true))
          .visible
          .kept
          .where(kind: params.expect(:type).split(','))
          .includes(recipes: :item)
          .includes(:homebrew_books)
      end
    end
  end
end
