# frozen_string_literal: true

credentials = Rails.application.credentials.dig(Rails.env.to_sym, :oauth) || {}

Authkeeper.configure do |config|
  config.access_token_name = :charkeeper_access_token
  config.domain = 'charkeeper.org' if Rails.env.production?
  config.fallback_url_session_name = :charkeeper_fallback_url

  config.omniauth_providers = %w[telegram]

  config.omniauth :telegram,
                  bot_name: credentials.dig(:telegram, :bot_name),
                  bot_secret: credentials.dig(:telegram, :bot_secret),
                  redirect_url: credentials.dig(:telegram, :redirect_url)
end
