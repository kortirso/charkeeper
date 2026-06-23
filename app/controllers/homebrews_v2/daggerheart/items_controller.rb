# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class ItemsController < HomebrewsV2::ItemsController
      private

      def serializer = ::HomebrewsV2::ListItemSerializer
      def show_serializer = ::HomebrewsV2::Daggerheart::ItemSerializer
      def class_name = ::Daggerheart::Item
    end
  end
end
