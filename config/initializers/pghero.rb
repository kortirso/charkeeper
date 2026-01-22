# frozen_string_literal: true

if Rails.env.production? || Rails.env.ru_production?
  # :skippit:
  ENV['PGHERO_USERNAME'] = Rails.application.credentials.dig(:admin, :username)
  ENV['PGHERO_PASSWORD'] = Rails.application.credentials.dig(:admin, :password)
  # :skippit:
end
