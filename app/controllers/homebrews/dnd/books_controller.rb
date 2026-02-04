# frozen_string_literal: true

module Homebrews
  module Dnd
    class BooksController < Homebrews::BooksController
      private

      def serializer = ::Homebrews::Dnd::BookSerializer
      def provider = 'dnd'
    end
  end
end
