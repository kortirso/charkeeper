# frozen_string_literal: true

class ApplicationController < ActionController::Base
  include Authkeeper::Controllers::Authentication

  append_view_path Rails.root.join('app/views/controllers')

  before_action :authenticate, except: %i[not_found]

  def not_found = page_not_found

  # rubocop: disable Lint/UselessMethodDefinition
  # https://github.com/dry-rb/dry-auto_inject/issues/91
  def initialize = super
  # rubocop: enable Lint/UselessMethodDefinition

  private

  def page_not_found
    render template: 'web/shared/404', status: :not_found, formats: [:html]
  end
end
