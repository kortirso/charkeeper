# frozen_string_literal: true

module Frontend
  module Cosmere
    module Characters
      class RestController < Frontend::BaseController
        include Deps[perform_rest: 'commands.characters_context.cosmere.rest.perform']

        before_action :find_character

        def create
          case perform_rest.call(rest_params.merge(character: @character))
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          in { result: result, recovery: recovery }
            render json: {
              character: ::Cosmere::CharacterSerializer.new.serialize(result),
              recovery: recovery
            }, status: :ok
          end
        end

        private

        def find_character
          @character = authorized_scope(Character.all).cosmere.find(params[:character_id])
        end

        def rest_params
          params.require(:rest).permit!.to_h
        end
      end
    end
  end
end
