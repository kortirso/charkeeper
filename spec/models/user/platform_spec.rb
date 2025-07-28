# frozen_string_literal: true

describe User::Platform do
  it 'factory should be valid' do
    user_platform = build :user_platform

    expect(user_platform).to be_valid
  end
end
