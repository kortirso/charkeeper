# frozen_string_literal: true

module HomebrewsV2
  module Dnd2024
    class BooksController < HomebrewsV2::BooksController
      private

      def serializer = ::Homebrews::Dnd::BookSerializer
      def provider = 'dnd'
    end
  end
end
