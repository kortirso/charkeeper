# frozen_string_literal: true

return unless Rails.env.production?

GoodJob::Engine.middleware.use(Rack::Auth::Basic) do |username, password|
  ActiveSupport::SecurityUtils.secure_compare(Rails.application.credentials.admin.username, username) &
    ActiveSupport::SecurityUtils.secure_compare(Rails.application.credentials.admin.password, password)
end
