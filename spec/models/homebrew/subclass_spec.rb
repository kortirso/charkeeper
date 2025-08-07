# frozen_string_literal: true

describe Homebrew::Subclass do
  it 'factory should be valid' do
    homebrew_subclass = build :homebrew_subclass, :daggerheart

    expect(homebrew_subclass).to be_valid
  end
end
