# frozen_string_literal: true

module HomebrewsV2
  module Cosmere
    class BooksController < HomebrewsV2::BooksController
      private

      def serializer = ::Homebrews::Cosmere::BookSerializer
      def provider = 'cosmere'
    end
  end
end
