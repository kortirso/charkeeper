# frozen_string_literal: true

module DiscordApi
  class Client < HttpService::Client
    include Requests::Commands

    BASE_URL = 'https://discord.com'

    option :url, default: proc { BASE_URL }

    private

    def headers
      {
        'Content-type' => 'application/json',
        'Authorization' => "Bot #{Rails.application.credentials.dig(:production, :discord_bot_token)}"
      }
    end
  end
end
