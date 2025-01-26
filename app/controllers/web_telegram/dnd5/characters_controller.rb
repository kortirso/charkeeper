# frozen_string_literal: true

module WebTelegram
  module Dnd5
    class CharactersController < WebTelegram::BaseController
      include Deps[character_update: 'commands.characters_context.dnd5.update']

      def update
        case character_update.call(update_params.merge({ character: character }))
        in { errors: errors } then render json: { errors: errors }, status: :unprocessable_entity
        else render json: { result: :ok }, status: :ok
        end
      end

      private

      def character
        current_user
          .user_characters
          .where(provider: User::Character::DND5)
          .find(params[:id])
          .characterable
      end

      def update_params
        params.require(:character).permit!.to_h
      end
    end
  end
end
