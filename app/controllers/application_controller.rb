# frozen_string_literal: true

class ApplicationController < ActionController::Base
  include Authkeeper::Controllers::Authentication

  append_view_path Rails.root.join('app/views/controllers')

  authorize :user, through: :current_user

  before_action :authenticate, except: %i[not_found]
  before_action :set_current_provider
  before_action :set_locale
  before_action do
    Rails.error.set_context(
      request_url: request.original_url,
      params: request.filtered_parameters.inspect,
      session: session.inspect
    )
  end

  rescue_from ActiveRecord::RecordNotFound, with: :page_not_found
  rescue_from ActionPolicy::Unauthorized, with: :access_denied

  def not_found = page_not_found

  # rubocop: disable Lint/UselessMethodDefinition
  # https://github.com/dry-rb/dry-auto_inject/issues/91
  def initialize = super
  # rubocop: enable Lint/UselessMethodDefinition

  private

  def page_not_found
    render template: 'web/shared/404', status: :not_found, formats: [:html]
  end

  def set_current_provider; end

  def set_locale
    I18n.locale =
      if current_user
        locale = current_user.provider_locales[@current_provider]
        if sublocaled? && locale && I18n.available_locales.include?(locale.to_sym) && locale.starts_with?(current_user.locale)
          locale
        else
          user_locale
        end
      else
        I18n.default_locale
      end
  end

  def user_locale
    current_user.locale || I18n.default_locale
  end

  def sublocaled?
    Charkeeper::Container.resolve('feature_requirement').call(current: params[:version], initial: '0.4.14')
  end
end
