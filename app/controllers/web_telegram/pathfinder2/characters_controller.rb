# frozen_string_literal: true

module WebTelegram
  module Pathfinder2
    class CharactersController < WebTelegram::BaseController
      include Deps[
        character_create: 'commands.characters_context.pathfinder2.create',
        character_update: 'commands.characters_context.pathfinder2.update'
      ]
      include SerializeResource

      CREATE_SERIALIZE_FIELDS = %i[id name object_data provider].freeze

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
          ::Pathfinder2::CharacterSerializer,
          :character,
          only: CREATE_SERIALIZE_FIELDS
        ), status: :created
      end

      def character
        current_user.characters.pathfinder2.find(params[:id])
      end

      def request_params
        params.require(:character).permit!.to_h
      end
    end
  end
end
