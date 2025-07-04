# frozen_string_literal: true

class ApplicationController < ActionController::Base
  include Authkeeper::Controllers::Authentication

  append_view_path Rails.root.join('app/views/controllers')

  authorize :user, through: :current_user

  before_action :authenticate, except: %i[not_found]
  before_action :set_locale
  before_action do
    Rails.error.set_context(
      request_url: request.original_url,
      params: request.filtered_parameters.inspect,
      session: session.inspect
    )
  end

  def not_found = page_not_found

  # rubocop: disable Lint/UselessMethodDefinition
  # https://github.com/dry-rb/dry-auto_inject/issues/91
  def initialize = super
  # rubocop: enable Lint/UselessMethodDefinition

  private

  def page_not_found
    render template: 'web/shared/404', status: :not_found, formats: [:html]
  end

  def set_locale
    I18n.locale = current_user&.locale || I18n.default_locale
  end
end
