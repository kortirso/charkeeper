# frozen_string_literal: true

module HomebrewsV2
  module Pathfinder2
    class BooksController < HomebrewsV2::BooksController
      private

      def serializer = ::Homebrews::Pathfinder2::BookSerializer
      def provider = 'pathfinder2'
    end
  end
end
