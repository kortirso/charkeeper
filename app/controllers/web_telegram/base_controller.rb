# frozen_string_literal: true

module WebTelegram
  class BaseController < ApplicationController
    protect_from_forgery with: :null_session

    before_action :authenticate
    before_action :set_locale

    private

    def set_locale
      I18n.locale = current_user&.locale || I18n.default_locale
    end
  end
end
