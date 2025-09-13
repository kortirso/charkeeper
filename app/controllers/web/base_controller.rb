# frozen_string_literal: true

module Web
  class BaseController < ApplicationController
    before_action :close_cookie_banner
    before_action :update_locale
    before_action :set_locale

    private

    def close_cookie_banner
      close_banner = params[:close_cookie_banner]
      return if close_banner.blank?

      cookies[:charkeeper_cookie_banner] = {
        value: 'off',
        domain: Rails.env.production? ? 'charkeeper.org' : nil
      }.compact
    end

    def update_locale
      switch_locale = params[:switch_locale]
      return if switch_locale.blank?
      return if I18n.available_locales.exclude?(switch_locale.to_sym)

      current_user&.update(locale: switch_locale)
      cookies[:charkeeper_locale] = {
        value: switch_locale,
        domain: Rails.env.production? ? 'charkeeper.org' : nil
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
  end
end
