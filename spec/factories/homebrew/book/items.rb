# frozen_string_literal: true

FactoryBot.define do
  factory :homebrew_book_item, class: 'Homebrew::Book::Item' do
    homebrew_book
    itemable factory: :homebrew_race
  end
end
