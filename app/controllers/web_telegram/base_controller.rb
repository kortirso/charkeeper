# frozen_string_literal: true

module WebTelegram
  class BaseController < ApplicationController
    protect_from_forgery with: :null_session

    before_action :set_locale

    rescue_from ActiveRecord::RecordNotFound, with: :page_not_found

    private

    def page_not_found
      render json: { errors: [t('not_found')] }, status: :not_found
    end

    def set_locale
      I18n.locale = current_user&.locale || I18n.default_locale
    end
  end
end
