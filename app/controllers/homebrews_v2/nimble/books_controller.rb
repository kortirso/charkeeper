# frozen_string_literal: true

module HomebrewsV2
  module Nimble
    class BooksController < HomebrewsV2::BooksController
      private

      def serializer = ::Homebrews::Nimble::BookSerializer
      def provider = 'nimble'
    end
  end
end
