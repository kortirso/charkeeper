# frozen_string_literal: true

module Homebrews
  module Users
    class BooksController < Frontend::BaseController
      before_action :find_book, only: %i[update]
      before_action :find_user_book, only: %i[update]

      def update
        @user_book ? @user_book.destroy : User::Book.create(user: current_user, book: @book)
        only_head_response
      end

      private

      def find_book
        @book = Homebrew::Book.shared.find(params[:id])
      end

      def find_user_book
        @user_book = User::Book.find_by(user: current_user, book: @book)
      end
    end
  end
end
