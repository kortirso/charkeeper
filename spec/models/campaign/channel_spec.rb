# frozen_string_literal: true

describe Campaign::Channel do
  it 'factory should be valid' do
    campaign_channel = build :campaign_channel

    expect(campaign_channel).to be_valid
  end
end
