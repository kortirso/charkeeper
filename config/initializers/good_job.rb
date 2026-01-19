# frozen_string_literal: true

if Rails.env.production? || Rails.env.ru_production?
  GoodJob::Engine.middleware.use(Rack::Auth::Basic) do |username, password|
    ActiveSupport::SecurityUtils.secure_compare(Rails.application.credentials.admin.username, username) &
      ActiveSupport::SecurityUtils.secure_compare(Rails.application.credentials.admin.password, password)
  end
end
