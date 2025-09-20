# frozen_string_literal: true

require_relative 'boot'

require 'rails'
# Pick the frameworks you want:
require 'active_model/railtie'
require 'active_job/railtie'
require 'active_record/railtie'
require 'active_storage/engine'
require 'action_controller/railtie'
require 'action_mailer/railtie'
# require 'action_mailbox/engine'
# require 'action_text/engine'
require 'action_view/railtie'
# require 'action_cable/engine'
# require 'rails/test_unit/railtie'
require 'sprockets/railtie'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Charkeeper
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.2

    config.active_job.queue_adapter = :good_job

    config.middleware.use Rack::Deflater
    # Rack::Brotli goes directly under Rack::Deflater, if Rack::Deflater is present
    config.middleware.use Rack::Brotli

    I18n.available_locales = %i[en ru]
    config.i18n.default_locale = :en

    config.time_zone = 'UTC'

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w[assets tasks])

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.

    config.generators.system_tests = nil
    config.generators do |g|
      g.test_framework :rspec, fixtures: true, views: false, view_specs: false, helper_specs: false,
                               routing_specs: false, controller_specs: false, request_specs: false
      g.fixture_replacement :factory_bot, dir: 'spec/factories'
      g.stylesheets false
      g.javascripts false
      g.helper false

      g.orm :active_record, primary_key_type: :uuid
    end
    #
    # config.time_zone = 'Central Time (US & Canada)'
    # config.eager_load_paths << Rails.root.join('extras')

    # Don't generate system test files.
    config.generators.system_tests = nil

    config.active_support.to_time_preserves_timezone = :zone

    # config.hosts << 'snxxui-95-179-120-153.ru.tuna.am'

    # Catch 404s
    config.after_initialize do |app|
      app.routes.append do
        match 'web_telegram/*path', to: 'frontend/base#not_found', via: :all
        match '*path', to: 'application#not_found', via: :all
      end
    end
  end
end
