# frozen_string_literal: true

module WebTelegram
  module Dnd5
    class CharactersController < WebTelegram::BaseController
      include Deps[
        character_create: 'commands.characters_context.dnd5.create',
        character_update: 'commands.characters_context.dnd5.update'
      ]

      def create
        case character_create.call(request_params.merge({ user: current_user }))
        in { errors: errors } then render json: { errors: errors }, status: :unprocessable_entity
        else render json: { result: :ok }, status: :created
        end
      end

      def update
        case character_update.call(request_params.merge({ character: character }))
        in { errors: errors } then render json: { errors: errors }, status: :unprocessable_entity
        else render json: { result: :ok }, status: :ok
        end
      end

      private

      def character
        current_user.characters.dnd5.find(params[:id])
      end

      def request_params
        params.require(:character).permit!.to_h
      end
    end
  end
end
