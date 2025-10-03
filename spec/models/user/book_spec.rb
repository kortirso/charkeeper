# frozen_string_literal: true

describe User::Book do
  it 'factory should be valid' do
    user_book = build :user_book

    expect(user_book).to be_valid
  end
end
