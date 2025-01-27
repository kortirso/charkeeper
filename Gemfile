# frozen_string_literal: true

source 'https://rubygems.org'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails', branch: 'main'
gem 'rack', '~> 3.0'
gem 'rack-brotli'
gem 'rack-session', '~> 2.0'
gem 'rackup', '~> 2.1'
gem 'rails', '~> 8.0.1'

# The modern asset pipeline for Rails [https://github.com/rails/propshaft]
gem 'jsbundling-rails'
gem 'propshaft'
gem 'tailwindcss-rails'

# Use postgresql as the database for Active Record
gem 'pg', '~> 1.1'

# Use the Puma web server [https://github.com/puma/puma]
gem 'puma', '>= 5.0'

# Reduces boot times through caching; required in config/boot.rb
gem 'bootsnap', require: false

# dry-rb system
gem 'dry-auto_inject', '~> 1.0'
gem 'dry-container', '~> 0.11.0'
gem 'dry-validation', '~> 1.10'

# Catch unsafe migrations in development
gem 'strong_migrations', '~> 2.0'

# Pretty print
gem 'awesome_print'

# running application
gem 'foreman'

# randoms
gem 'securerandom', '0.3.2'

# api serializer
gem 'oj'
gem 'panko_serializer'

# auth
gem 'authkeeper', '0.1.6'
gem 'jwt', '~> 2.5'

# Work with JSON-backed attributes
gem 'store_model'

group :development, :test do
  gem 'rubocop', '~> 1.35', require: false
  gem 'rubocop-factory_bot', '~> 2.0', require: false
  gem 'rubocop-performance', '~> 1.14', require: false
  gem 'rubocop-rails', '~> 2.15', require: false
  gem 'rubocop-rspec', '~> 3.0', require: false
  gem 'rubocop-rspec_rails', '~> 2.0', require: false
end

group :test do
  gem 'database_cleaner', '~> 2.0'
  gem 'factory_bot_rails', '~> 6.4'
  gem 'json_spec', '1.1.5'
  gem 'rspec-rails', '~> 7.0'
  gem 'shoulda-matchers', '~> 6.0'
  gem 'simplecov', require: false
end
