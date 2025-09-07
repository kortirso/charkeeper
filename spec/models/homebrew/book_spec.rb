# frozen_string_literal: true

describe Homebrew::Book do
  it 'factory should be valid' do
    homebrew_book = build :homebrew_book

    expect(homebrew_book).to be_valid
  end
end
