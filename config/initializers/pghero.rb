# frozen_string_literal: true

return unless Rails.env.production?

# :skippit:
ENV['PGHERO_USERNAME'] = Rails.application.credentials.dig(:admin, :username)
ENV['PGHERO_PASSWORD'] = Rails.application.credentials.dig(:admin, :password)
# :skippit:
