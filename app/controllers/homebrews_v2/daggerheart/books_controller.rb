# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class BooksController < HomebrewsV2::BooksController
      private

      def serializer = ::Homebrews::Daggerheart::BookSerializer
      def provider = 'daggerheart'
    end
  end
end
