# frozen_string_literal: true

describe Homebrew::Book::Item do
  it 'factory should be valid' do
    homebrew_book_item = build :homebrew_book_item

    expect(homebrew_book_item).to be_valid
  end
end
