# frozen_string_literal: true

module Frontend
  module Dc20
    module Characters
      class RestController < Frontend::BaseController
        include Deps[
          perform: 'commands.characters_context.dc20.rest.perform'
        ]

        before_action :find_character

        def create
          case perform.call(rest_params.merge({ character: @character }))
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          else only_head_response
          end
        end

        private

        def find_character
          @character = authorized_scope(Character.all).dc20.find(params[:character_id])
        end

        def rest_params
          params.require(:character).permit!.to_h
        end
      end
    end
  end
end
