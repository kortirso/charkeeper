# frozen_string_literal: true

describe Campaign::Item do
  it 'factory should be valid' do
    campaign_item = build :campaign_item

    expect(campaign_item).to be_valid
  end
end
