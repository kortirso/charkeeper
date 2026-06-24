# frozen_string_literal: true

module Frontend
  module Homebrews
    class BooksController < Frontend::BaseController
      include SerializeRelation

      before_action :find_book, only: %i[update]
      before_action :find_user_book, only: %i[update]

      def index
        serialize_relation(
          books,
          ::Homebrews::BookSerializer,
          :books,
          {},
          { enabled_books: current_user.books.ids, current_user_id: current_user.id }
        )
      end

      def update
        @user_book ? @user_book.destroy : User::Book.create(user: current_user, book: @book)
        only_head_response
      end

      private

      def books
        Homebrew::Book.where(user_id: current_user.id)
          .or(Homebrew::Book.where(shared: true))
      end

      def find_book
        @book = Homebrew::Book.shared.find(params.expect(:id))
      end

      def find_user_book
        @user_book = User::Book.find_by(user: current_user, book: @book)
      end
    end
  end
end
