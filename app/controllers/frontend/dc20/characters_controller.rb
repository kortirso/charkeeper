# frozen_string_literal: true

module Frontend
  module Dc20
    class CharactersController < Frontend::BaseController
      include Deps[
        character_create: 'commands.characters_context.dc20.create',
        character_update: 'commands.characters_context.dc20.update'
      ]
      include SerializeResource

      CREATE_SERIALIZE_FIELDS = %i[id name level provider avatar].freeze

      def create
        case character_create.call(request_params.merge({ user: current_user }))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result } then render_character(result, { only: CREATE_SERIALIZE_FIELDS }, :created)
        end
      end

      def update
        case character_update.call(request_params.merge({ character: character }))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        else render_character(character, {}, :ok)
        end
      end

      private

      def render_character(result, fields, status)
        serialize_resource(result, ::Dc20::CharacterSerializer, :character, fields, status)
      end

      def character
        authorized_scope(Character.all).dc20.find(params[:id])
      end

      def request_params
        params.require(:character).permit!.to_h
      end
    end
  end
end
