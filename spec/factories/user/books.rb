# frozen_string_literal: true

FactoryBot.define do
  factory :user_book, class: 'User::Book' do
    user
    book factory: :homebrew_book
  end
end
