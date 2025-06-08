# frozen_string_literal: true

module WebTelegram
  class BaseController < ApplicationController
    protect_from_forgery with: :null_session

    before_action :set_locale

    rescue_from ActiveRecord::RecordNotFound, with: :page_not_found

    private

    def only_head_response
      render json: { result: :ok }, status: :ok
    end

    def page_not_found
      render json: { errors: [t('not_found')] }, status: :not_found
    end

    def unprocessable_response(errors)
      render json: { errors: errors }, status: :unprocessable_entity
    end

    def set_locale
      I18n.locale = current_user&.locale || I18n.default_locale
    end
  end
end
