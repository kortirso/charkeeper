# frozen_string_literal: true

module Frontend
  module Bots
    class CharactersController < Frontend::BaseController
      include Deps[bot_service: 'services.bot_context_v2.character_bot']

      # /roll d12 d12
      # /dualityRoll d12 d20
      # /fateRoll 1
      # /check attack Цеп --bonus 4
      def create
        render json: { result: bot_service.call(messages: params[:values], character: character) }, status: :ok
      end

      private

      def character
        current_user.characters.find(params[:id])
      end
    end
  end
end
