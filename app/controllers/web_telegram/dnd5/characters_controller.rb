# frozen_string_literal: true

module WebTelegram
  module Dnd5
    class CharactersController < WebTelegram::BaseController
      include Deps[
        character_create: 'commands.characters_context.dnd5.create',
        character_update: 'commands.characters_context.dnd5.update'
      ]
      include SerializeResource

      CREATE_SERIALIZE_FIELDS = %i[id name level race subrace classes provider avatar].freeze

      def create
        case character_create.call(request_params.merge({ user: current_user }))
        in { errors: errors } then render json: { errors: errors }, status: :unprocessable_entity
        in { result: result } then render_character(result, { only: CREATE_SERIALIZE_FIELDS }, :created)
        end
      end

      def update
        case character_update.call(request_params.merge({ character: character }))
        in { errors: errors } then render json: { errors: errors }, status: :unprocessable_entity
        else render_character(character, {}, :ok)
        end
      end

      private

      def render_character(result, fields, status)
        serialize_resource(
          result,
          ::Dnd5::CharacterSerializer,
          :character,
          fields,
          status
        )
      end

      def character
        current_user.characters.dnd5.find(params[:id])
      end

      def request_params
        params.require(:character).permit!.to_h
      end
    end
  end
end
