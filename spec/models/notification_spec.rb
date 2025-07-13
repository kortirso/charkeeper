# frozen_string_literal: true

describe Notification do
  it 'factory should be valid' do
    notification = build :notification

    expect(notification).to be_valid
  end
end
