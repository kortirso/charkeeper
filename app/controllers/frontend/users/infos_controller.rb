# frozen_string_literal: true

module Frontend
  module Users
    class InfosController < Frontend::BaseController
      def show
        render json: {
          locale: current_user.locale,
          username: current_user.username,
          admin: current_user.admin?,
          color_schema: current_user.color_schema,
          provider_locales: current_user.provider_locales
        }, status: :ok
      end
    end
  end
end
