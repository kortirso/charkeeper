# frozen_string_literal: true

module WebTelegram
  module Dnd5
    module Characters
      class HealthController < WebTelegram::BaseController
        include Deps[
          change_health: 'commands.characters_context.dnd5.change_health'
        ]

        def create
          change_health.call({ character: character, value: params[:value] })
          render json: { result: :ok }, status: :ok
        end

        private

        def character
          current_user.characters.dnd5.find(params[:character_id])
        end
      end
    end
  end
end
