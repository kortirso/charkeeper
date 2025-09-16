# frozen_string_literal: true

module Adminbook
  class BaseController < ApplicationController
    include Pagy::Backend

    http_basic_authenticate_with name: Rails.application.credentials.admin&.fetch(:username, '') || '',
                                 password: Rails.application.credentials.admin&.fetch(:password, '') || '',
                                 if: -> { Rails.env.production? }

    skip_before_action :authenticate

    layout 'adminbook'
  end
end
