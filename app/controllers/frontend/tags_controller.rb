# frozen_string_literal: true

module Frontend
  class TagsController < Frontend::BaseController
    include TranslateHelper

    def show
      render json: {
        value: catch_missing_i18n(params[:id]) { I18n.t("tags.#{params[:provider]}.#{params[:type]}.#{params[:id]}") }
      }, status: :ok
    end
  end
end
