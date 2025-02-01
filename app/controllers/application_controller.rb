# frozen_string_literal: true

class ApplicationController < ActionController::Base
  append_view_path Rails.root.join('app/views/controllers')

  # rubocop: disable Lint/UselessMethodDefinition, Style/RedundantInitialize
  # https://github.com/dry-rb/dry-auto_inject/issues/91
  def initialize = super
  # rubocop: enable Lint/UselessMethodDefinition, Style/RedundantInitialize
end
