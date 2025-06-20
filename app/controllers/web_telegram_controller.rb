# frozen_string_literal: true

class WebTelegramController < ApplicationController
  layout 'charkeeper_app'

  skip_before_action :authenticate

  def index
    response.headers.delete('X-Frame-Options')
  end
end
