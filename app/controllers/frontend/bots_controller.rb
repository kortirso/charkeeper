# frozen_string_literal: true

module Frontend
  class BotsController < Frontend::BaseController
    def create
      only_head_response

      # BotService.call({ source: 'web', message: params[:value], data: { user: current_user } })
    end
  end
end
