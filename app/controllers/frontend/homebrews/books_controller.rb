# frozen_string_literal: true

module Frontend
  module Homebrews
    class BooksController < Frontend::BaseController
      include SerializeRelation

      def index
        serialize_relation(books, serializer, :books, {}, { enabled_books: current_user.books.ids })
      end

      private

      def books
        Homebrew::Book.where(provider: params[:provider], user_id: current_user.id)
          .or(Homebrew::Book.where(provider: params[:provider], shared: true).where.not(user_id: current_user.id))
          .includes(:items)
      end

      def serializer
        case params[:provider]
        when 'daggerheart' then ::Daggerheart::Homebrew::BookSerializer
        end
      end
    end
  end
end
