# frozen_string_literal: true

Authkeeper.configure do |config|
  config.access_token_name = :charkeeper_access_token
  config.domain = 'charkeeper.org' if Rails.env.production?
  config.fallback_url_session_name = :charkeeper_fallback_url

  config.omniauth_providers = []
end
