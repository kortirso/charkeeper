# frozen_string_literal: true

describe Campaign::Character do
  it 'factory should be valid' do
    campaign_character = build :campaign_character

    expect(campaign_character).to be_valid
  end
end
