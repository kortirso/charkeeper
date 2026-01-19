# frozen_string_literal: true

credentials = Rails.application.credentials.dig(Rails.env.to_sym, :oauth) || {}

Authkeeper.configure do |config|
  if Rails.env.production?
    config.domain = 'charkeeper.org'
    config.access_token_name = :charkeeper_access_token
  elsif Rails.env.ru_production?
    config.domain = 'charkeeper.ru'
    config.access_token_name = :charkeeper_ru_access_token
  else
    config.access_token_name = :charkeeper_access_token
  end

  config.fallback_url_session_name = :charkeeper_fallback_url
  config.current_user_cache_minutes = 5

  config.omniauth_providers = %w[telegram google discord]

  config.omniauth :telegram,
                  bot_name: credentials.dig(:telegram, :bot_name),
                  bot_secret: credentials.dig(:telegram, :bot_secret),
                  redirect_url: credentials.dig(:telegram, :redirect_url)

  config.omniauth :google,
                  client_id: credentials.dig(:google, :client_id),
                  client_secret: credentials.dig(:google, :client_secret),
                  redirect_url: credentials.dig(:google, :redirect_url)

  config.omniauth :discord,
                  client_id: credentials.dig(:discord, :client_id),
                  client_secret: credentials.dig(:discord, :client_secret),
                  redirect_url: credentials.dig(:discord, :redirect_url)
end
