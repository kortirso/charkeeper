# frozen_string_literal: true

describe User::Identity do
  it 'factory should be valid' do
    user_identity = build :user_identity

    expect(user_identity).to be_valid
  end
end
