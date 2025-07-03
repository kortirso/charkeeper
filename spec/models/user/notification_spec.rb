# frozen_string_literal: true

describe User::Notification do
  it 'factory should be valid' do
    user_notification = build :user_notification

    expect(user_notification).to be_valid
  end
end
