# frozen_string_literal: true

module HomebrewsV2
  module Books
    class ItemsController < Homebrews::BaseController
      before_action :find_book, only: %i[create]

      def create
        case command.call({ user: current_user, book: @book, ids: params[:ids], itemable_type: params[:itemable_type] })
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        else only_head_response
        end
      end

      private

      def find_book
        @book = Homebrew::Book.where(user_id: current_user.id).find(params.expect(:book_id))
      end

      def command = HomebrewsV2Context::Books::Items::UpsertCommand.new
    end
  end
end
