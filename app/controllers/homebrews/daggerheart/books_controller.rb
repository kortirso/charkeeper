# frozen_string_literal: true

module Homebrews
  module Daggerheart
    class BooksController < Frontend::BaseController
      include Deps[
        refresh_user_data: 'services.homebrews_context.refresh_user_data'
      ]

      include SerializeRelation

      before_action :find_book, only: %i[update]
      before_action :find_user_book, only: %i[update]

      def index
        serialize_relation(books, ::Daggerheart::Homebrew::BookSerializer, :books, {}, { enabled_books: current_user.books.ids })
      end

      def update
        @user_book ? @user_book.destroy : User::Book.create(user: current_user, book: @book)
        refresh_user_data.call(user: current_user)
        only_head_response
      end

      private

      def books
        Homebrew::Book.where(provider: 'daggerheart', user_id: current_user.id)
          .or(Homebrew::Book.where(provider: 'daggerheart', shared: true).where.not(user_id: current_user.id))
          .includes(:items)
      end

      def find_book
        @book = Homebrew::Book.shared.find(params[:id])
      end

      def find_user_book
        @user_book = User::Book.find_by(user: current_user, book: @book)
      end
    end
  end
end
