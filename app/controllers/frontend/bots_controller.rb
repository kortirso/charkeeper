# frozen_string_literal: true

module Frontend
  class BotsController < Frontend::BaseController
    include Deps[handle_service: 'services.bot_context.handle']

    def create
      render json: handle_service.call(
        source: (params[:source] || :web).to_sym, message: params[:value], data: { user: current_user, character: character }
      ), status: :ok
    end

    private

    def character
      current_user.characters.find_by(id: params[:character_id]) if params[:character_id]
    end
  end
end
