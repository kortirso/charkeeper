# frozen_string_literal: true

module WebTelegram
  module Dnd2024
    class CharactersController < WebTelegram::BaseController
      include Deps[
        character_create: 'commands.characters_context.dnd2024.create',
        character_update: 'commands.characters_context.dnd2024.update'
      ]
      include SerializeResource

      CREATE_SERIALIZE_FIELDS = %i[id name level species legacy classes provider avatar].freeze

      def create
        case character_create.call(request_params.merge({ user: current_user }))
        in { errors: errors } then render json: { errors: errors }, status: :unprocessable_entity
        in { result: result } then render_character(result)
        end
      end

      def update
        case character_update.call(request_params.merge({ character: character }))
        in { errors: errors } then render json: { errors: errors }, status: :unprocessable_entity
        else render json: { result: :ok }, status: :ok
        end
      end

      private

      def render_character(result)
        render json: serialize_resource(
          result,
          ::Dnd2024::CharacterSerializer,
          :character,
          only: CREATE_SERIALIZE_FIELDS
        ), status: :created
      end

      def character
        current_user.characters.dnd2024.find(params[:id])
      end

      def request_params
        params.require(:character).permit!.to_h
      end
    end
  end
end
