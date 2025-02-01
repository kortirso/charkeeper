# frozen_string_literal: true

class WebTelegramController < ApplicationController
  layout 'web_telegram'

  skip_before_action :authenticate

  def index
    response.headers.delete('X-Frame-Options')
  end
end
