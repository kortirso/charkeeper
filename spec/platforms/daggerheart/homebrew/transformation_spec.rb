# frozen_string_literal: true

describe Daggerheart::Homebrew::Transformation do
  it 'factory should be valid' do
    homebrew_transformation = build :homebrew_transformation

    expect(homebrew_transformation).to be_valid
  end
end
