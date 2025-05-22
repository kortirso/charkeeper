# frozen_string_literal: true

module WebTelegram
  module Daggerheart
    class CharactersController < WebTelegram::BaseController
      include Deps[
        character_create: 'commands.characters_context.daggerheart.create',
        character_update: 'commands.characters_context.daggerheart.update'
      ]
      include SerializeResource

      CREATE_SERIALIZE_FIELDS = %i[id name level race classes provider avatar].freeze

      def create
        case character_create.call(request_params.merge({ user: current_user }))
        in { errors: errors } then render json: { errors: errors }, status: :unprocessable_entity
        in { result: result } then render_character(result, { only: CREATE_SERIALIZE_FIELDS }, :created)
        end
      end

      def update
        case character_update.call(request_params.merge({ character: character }))
        in { errors: errors } then render json: { errors: errors }, status: :unprocessable_entity
        else render_character(character.reload, {}, :ok)
        end
      end

      private

      def render_character(result, fields, status)
        render json: serialize_resource(
          result,
          ::Daggerheart::CharacterSerializer,
          :character,
          fields
        ), status: status
      end

      def character
        current_user.characters.daggerheart.find(params[:id])
      end

      def request_params
        params.require(:character).permit!.to_h
      end
    end
  end
end
