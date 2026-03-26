# frozen_string_literal: true

module Frontend
  module Cosmere
    class CharactersController < Frontend::BaseController
      include Deps[
        character_create: 'commands.characters_context.cosmere.create'
      ]
      include SerializeResource

      CREATE_SERIALIZE_FIELDS = %i[id name level provider avatar].freeze

      def create
        case character_create.call(request_params.merge({ user: current_user }))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result } then render_character(result)
        end
      end

      private

      def render_character(result)
        serialize_resource(result, ::Cosmere::CharacterSerializer, :character, { only: CREATE_SERIALIZE_FIELDS }, :created)
      end

      def character
        authorized_scope(Character.all).cosmere.find(params[:id])
      end

      def request_params
        params[:character] ? params.require(:character).permit!.to_h : params.permit!.to_h
      end
    end
  end
end
