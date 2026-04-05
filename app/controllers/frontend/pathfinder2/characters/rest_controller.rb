# frozen_string_literal: true

module Frontend
  module Pathfinder2
    module Characters
      class RestController < Frontend::BaseController
        include Deps[perform_rest: 'commands.characters_context.pathfinder2.rest.perform']

        before_action :find_character

        def create
          case perform_rest.call(character: @character, constitution: params[:constitution], health_limit: params[:health_limit])
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          else only_head_response
          end
        end

        private

        def find_character
          @character = authorized_scope(Character.all).pathfinder2.find(params[:character_id])
        end
      end
    end
  end
end
