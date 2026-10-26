# frozen_string_literal: true

module Web
  class BaseController < ApplicationController
    before_action :update_locale
    before_action :set_locale

    rescue_from ActionController::TooManyRequests, with: :too_many_requests
    rescue_from I18n::InvalidLocale, with: :page_not_found

    private

    def update_locale
      switch_locale = params[:locale]
      return if switch_locale.blank?
      return if I18n.available_locales.exclude?(switch_locale.to_sym)

      current_user&.update(locale: switch_locale)
      cookies[:charkeeper_locale] = {
        value: switch_locale,
        domain: current_domain
      }.compact
    end

    def set_locale
      locale = params[:locale]&.to_sym
      I18n.locale =
        if I18n.available_locales.include?(locale)
          locale
        else
          current_locale
        end
    end

    def current_locale
      current_user&.locale.presence&.to_sym || cookies[:charkeeper_locale].presence&.to_sym || I18n.default_locale
    end

    def current_domain
      return 'charkeeper.org' if Rails.env.production?

      'charkeeper.ru' if Rails.env.ru_production?
    end

    def too_many_requests
      redirect_to too_many_requests_path
    end
  end
end
