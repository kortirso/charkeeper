# frozen_string_literal: true

module Homebrews
  module Daggerheart
    module Books
      class ContentsController < Homebrews::BaseController
        include Deps[
          add_book_items_command: 'commands.homebrew_context.daggerheart.add_book_items'
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
          when 'item' then add_book_items_command
          end
        end

        def find_own_book
          @book = Homebrew::Book.where(provider: 'daggerheart', user_id: current_user.id).find(params.expect(:book_id))
        end
      end
    end
  end
end
