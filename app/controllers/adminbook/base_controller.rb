# frozen_string_literal: true

module Adminbook
  class BaseController < ApplicationController
    http_basic_authenticate_with name: Rails.application.credentials.adminbook[:username],
                                 password: Rails.application.credentials.adminbook[:password],
                                 if: -> { Rails.env.production? }

    skip_before_action :authenticate

    layout 'adminbook'
  end
end
