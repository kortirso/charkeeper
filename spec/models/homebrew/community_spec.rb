# frozen_string_literal: true

describe Homebrew::Community do
  it 'factory should be valid' do
    homebrew_community = build :homebrew_community, :daggerheart

    expect(homebrew_community).to be_valid
  end
end
