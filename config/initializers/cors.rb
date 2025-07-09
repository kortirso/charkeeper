# frozen_string_literal: true

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins '*'
    resource '/frontend/*', headers: :any, methods: %i[get post put patch delete options head], credentials: false
  end
end
