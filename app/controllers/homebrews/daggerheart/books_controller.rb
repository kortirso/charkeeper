# frozen_string_literal: true

module Homebrews
  module Daggerheart
    class BooksController < Frontend::BaseController
      include Deps[
        add_book: 'commands.homebrew_context.add_book'
      ]

      include SerializeRelation
      include SerializeResource

      before_action :find_book, only: %i[update]
      before_action :find_user_book, only: %i[update]
      before_action :find_own_book, only: %i[destroy]

      def index
        serialize_relation(
          books,
          ::Daggerheart::Homebrew::BookSerializer,
          :books,
          {},
          { enabled_books: current_user.books.ids, current_user_id: current_user.id }
        )
      end

      def create
        case add_book.call(book_params.merge(user: current_user, provider: 'daggerheart'))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(
            result, ::Daggerheart::Homebrew::BookSerializer, :book, {}, :created, current_user_id: current_user.id
          )
        end
      end

      def update
        @user_book ? @user_book.destroy : User::Book.create(user: current_user, book: @book)
        only_head_response
      end

      def destroy
        @book.destroy
        only_head_response
      end

      private

      def books
        Homebrew::Book.where(provider: 'daggerheart', user_id: current_user.id)
          .or(Homebrew::Book.where(provider: 'daggerheart', shared: true))
          .or(Homebrew::Book.where(provider: 'daggerheart', public: true))
          .includes(:items)
      end

      def find_book
        @book = Homebrew::Book.shared.find(params[:id])
      end

      def find_user_book
        @user_book = User::Book.find_by(user: current_user, book: @book)
      end

      def find_own_book
        @book = Homebrew::Book.where(provider: 'daggerheart', user_id: current_user.id).find(params[:id])
      end

      def book_params
        params.require(:brewery).permit!.to_h
      end
    end
  end
end
