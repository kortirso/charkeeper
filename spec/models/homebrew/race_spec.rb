# frozen_string_literal: true

describe Homebrew::Race do
  it 'factory should be valid' do
    homebrew_race = build :homebrew_race, :daggerheart

    expect(homebrew_race).to be_valid
  end
end
