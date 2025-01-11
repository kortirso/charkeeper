# frozen_string_literal: true

describe User::Session do
  it 'factory should be valid' do
    user_session = build :user_session

    expect(user_session).to be_valid
  end
end
