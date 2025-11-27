# frozen_string_literal: true

module Homebrews
  module Daggerheart
    module Books
      class ContentsController < Homebrews::BaseController
        include Deps[
          add_book_races_command: 'commands.homebrew_context.daggerheart.add_book_races',
          add_book_communities_command: 'commands.homebrew_context.daggerheart.add_book_communities',
          add_book_transformations_command: 'commands.homebrew_context.daggerheart.add_book_transformations',
          add_book_domains_command: 'commands.homebrew_context.daggerheart.add_book_domains',
          add_book_subclasses_command: 'commands.homebrew_context.daggerheart.add_book_subclasses',
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
          when 'ancestry' then add_book_races_command
          when 'community' then add_book_communities_command
          when 'transformation' then add_book_transformations_command
          when 'domain' then add_book_domains_command
          when 'subclass' then add_book_subclasses_command
          when 'item' then add_book_items_command
          end
        end

        def find_own_book
          @book = Homebrew::Book.where(provider: 'daggerheart', user_id: current_user.id).find(params[:book_id])
        end
      end
    end
  end
end
