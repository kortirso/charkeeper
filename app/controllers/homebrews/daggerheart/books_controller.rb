# frozen_string_literal: true

module Homebrews
  module Daggerheart
    class BooksController < Frontend::BaseController
      include Deps[
        add_book: 'commands.homebrew_context.books.add',
        change_book: 'commands.homebrew_context.books.change'
      ]

      include SerializeRelation
      include SerializeResource

      before_action :find_own_book, only: %i[update destroy]

      def index
        serialize_relation(
          books,
          ::Homebrews::Daggerheart::BookSerializer,
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
            result, ::Homebrews::Daggerheart::BookSerializer, :book, {}, :created, current_user_id: current_user.id
          )
        end
      end

      def update
        case change_book.call(book_params.merge(book: @book))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        else only_head_response
        end
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

      def find_own_book
        @book = Homebrew::Book.where(provider: 'daggerheart', user_id: current_user.id).find(params[:id])
      end

      def book_params
        params.require(:brewery).permit!.to_h
      end
    end
  end
end
