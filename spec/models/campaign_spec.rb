# frozen_string_literal: true

describe Campaign do
  it 'factory should be valid' do
    campaign = build :campaign

    expect(campaign).to be_valid
  end
end
