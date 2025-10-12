# frozen_string_literal: true

describe Channel do
  it 'factory should be valid' do
    channel = build :channel

    expect(channel).to be_valid
  end
end
