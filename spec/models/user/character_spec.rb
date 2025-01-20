# frozen_string_literal: true

describe User::Character do
  it 'factory should be valid' do
    user_character = build :user_character

    expect(user_character).to be_valid
  end
end
