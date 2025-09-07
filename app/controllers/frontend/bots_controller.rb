# frozen_string_literal: true

module Frontend
  class BotsController < Frontend::BaseController
    include Deps[handle_service: 'services.bot_context.handle']

    def create
      render json: handle_service.call(source: :web, message: params[:value], data: { user: current_user }), status: :ok
    end
  end
end
