# frozen_string_literal: true

describe User::Homebrew do
  it 'factory should be valid' do
    user_homebrew = build :user_homebrew

    expect(user_homebrew).to be_valid
  end
end
