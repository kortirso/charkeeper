# frozen_string_literal: true

module Frontend
  module Daggerheart
    module Characters
      class HomebrewItemsController < Frontend::BaseController
        include Deps[
          add_item: 'commands.characters_context.daggerheart.homebrew.add_item'
        ]

        before_action :find_character

        def create
          case add_item.call(create_params.merge({ character: @character, user: current_user }))
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          else only_head_response
          end
        end

        private

        def find_character
          @character = authorized_scope(Character.all).daggerheart.find(params[:character_id])
        end

        def create_params
          params.require(:item).permit!.to_h
        end
      end
    end
  end
end
