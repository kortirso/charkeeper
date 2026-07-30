# frozen_string_literal: true

module Frontend
  module Nimble
    module Characters
      class RestController < Frontend::Nimble::BaseController
        include Deps[
          perform: 'commands.characters_context.nimble.rest.perform'
        ]

        before_action :find_character

        def create
          case perform.call(rest_params.merge({ character: @character }))
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          in { result: result, recovery: recovery }
            render json: {
              character: ::Nimble::CharacterSerializer.new(context: { version: params[:version] }).serialize(result),
              recovery: recovery
            }, status: :ok
          end
        end

        private

        def find_character
          @character = authorized_scope(Character.all).nimble.find(params.expect(:character_id))
        end

        def rest_params
          params.require(:character).permit!.to_h
        end
      end
    end
  end
end
