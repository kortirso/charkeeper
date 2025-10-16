# frozen_string_literal: true

describe Daggerheart::Homebrew::Domain do
  it 'factory should be valid' do
    homebrew_domain = build :homebrew_domain

    expect(homebrew_domain).to be_valid
  end
end
