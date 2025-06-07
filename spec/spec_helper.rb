# frozen_string_literal: true

require 'simplecov'

SimpleCov.start do
  nocov_token 'skippit'

  add_group 'Builders', 'app/builders'
  add_group 'Controllers', 'app/controllers'
  add_group 'Commands', 'app/commands'
  add_group 'Decorators', 'app/decorators'
  add_group 'Models', 'app/models'
  add_group 'Services', 'app/services'
  add_group 'Jobs', 'app/jobs'
  add_group 'Serializers', 'app/serializers'
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
