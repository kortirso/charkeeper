# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class ItemsController < HomebrewsV2::ItemsController
      private

      def serializer = ::HomebrewsV2::ListItemSerializer
      def show_serializer = ::HomebrewsV2::Daggerheart::ItemSerializer
      def class_name = ::Daggerheart::Item

      def items
        class_name.where(user_id: current_user.id).or(class_name.where(public: true))
          .where(itemable: nil)
          .where(kind: params.expect(:type).split(','))
          .includes(recipes: :item)
      end
    end
  end
end
