# frozen_string_literal: true

class WebTelegramController < ApplicationController
  layout 'web_telegram'

  def index
    response.headers.delete('X-Frame-Options')
  end
end
