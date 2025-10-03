# frozen_string_literal: true

module Frontend
  module Users
    class BooksController < Frontend::BaseController
      include Deps[
        refresh_user_data: 'services.homebrews_context.refresh_user_data'
      ]

      before_action :find_book, only: %i[update]
      before_action :find_user_book, only: %i[update]

      def update
        @user_book ? @user_book.destroy : User::Book.create(user: current_user, book: @book)
        refresh_user_data.call(user: current_user)
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
