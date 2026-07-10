# frozen_string_literal: true

module HomebrewsV2
  class BooksController < HomebrewsV2::BaseController
    include Deps[
      add_book: 'commands.homebrew_context.books.add',
      change_book: 'commands.homebrew_context.books.change'
    ]
    include SerializeRelation
    include SerializeResource

    before_action :find_book, only: %i[show]
    before_action :find_own_book, only: %i[update destroy]

    def index
      serialize_relation(
        books,
        serializer,
        :homebrews,
        { except: %i[items] },
        { enabled_books: current_user.books.ids, current_user_id: current_user.id }
      )
    end

    def show
      serialize_resource(@book, serializer, :homebrew)
    end

    def create
      case add_book.call(book_params.merge(user: current_user, provider: provider))
      in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
      in { result: result } then serialize_resource(result, serializer, :book, {}, :created, current_user_id: current_user.id)
      end
    end

    def update
      case change_book.call(book_params.merge(book: @book))
      in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
      else serialize_resource(@book.reload, serializer, :book, {}, :ok, current_user_id: current_user.id)
      end
    end

    def destroy
      @book.destroy
      only_head_response
    end

    def for_items
      serialize_relation(books_for_items, serializer, :books, { only: %i[id title] })
    end

    private

    def find_book
      @book = ::Homebrew::Book.find(params.expect(:id))
    end

    def books
      Homebrew::Book.where(provider: provider, user_id: current_user.id)
        .or(Homebrew::Book.where(provider: provider, shared: true))
        .or(Homebrew::Book.where(provider: provider, public: true))
        .includes(:items)
    end

    def books_for_items
      Homebrew::Book.where(provider: provider, user_id: current_user.id).where(shared: [nil, false])
    end

    def find_own_book
      @book = Homebrew::Book.where(provider: provider, user_id: current_user.id).find(params.expect(:id))
    end

    def book_params
      params.require(:book).permit!.to_h
    end
  end
end
