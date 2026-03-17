# frozen_string_literal: true

module Homebrews
  module Dnd
    module Books
      class ContentsController < Homebrews::BaseController
        include Deps[
          add_book_subclasses_command: 'commands.homebrew_context.dnd.books.add_subclasses'
        ]

        before_action :find_own_book, only: %i[create]

        def create
          case command.call({ user: current_user, book: @book, ids: params[:ids] })
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          in { result: result } then only_head_response
          end
        end

        private

        def command
          case params[:type]
          when 'subclass' then add_book_subclasses_command
          end
        end

        def find_own_book
          @book = Homebrew::Book.where(provider: 'dnd', user_id: current_user.id).find(params[:book_id])
        end
      end
    end
  end
end
