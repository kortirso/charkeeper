# frozen_string_literal: true

RSpec.configure do |config|
  config.before(:suite) do
    DatabaseCleaner.strategy = :transaction
    DatabaseCleaner.clean_with(:truncation)
  end

  # rubocop: disable-next RSpec/HookArgument
  config.around(:each) do |example|
    DatabaseCleaner.cleaning do
      example.run
    end
  end
end
