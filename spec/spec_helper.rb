# frozen_string_literal: true

require 'simplecov'

SimpleCov.start do
  SimpleCov.group 'Builders', 'app/builders'
  SimpleCov.group 'Controllers', 'app/controllers'
  SimpleCov.group 'Commands', 'app/commands'
  SimpleCov.group 'Decorators', 'app/decorators'
  SimpleCov.group 'DecoratorsV2', 'app/decorators_v2'
  SimpleCov.group 'Models', 'app/models'
  SimpleCov.group 'Services', 'app/services'
  SimpleCov.group 'Jobs', 'app/jobs'
  SimpleCov.group 'Serializers', 'app/serializers'
end

RSpec.configure do |config|
  config.expect_with :rspec do |expectations|
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end

  config.mock_with :rspec do |mocks|
    mocks.verify_partial_doubles = true
  end

  config.shared_context_metadata_behavior = :apply_to_host_groups
end
