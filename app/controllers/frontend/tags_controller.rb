# frozen_string_literal: true

module Frontend
  class TagsController < Frontend::BaseController
    def show
      render json: {
        value: I18n.t("tags.#{params[:provider]}.#{params[:type]}.#{params[:id]}")
      }, status: :ok
    end
  end
end
