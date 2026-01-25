# frozen_string_literal: true

describe Campaign::Note do
  it 'factory should be valid' do
    campaign_note = build :campaign_note

    expect(campaign_note).to be_valid
  end
end
