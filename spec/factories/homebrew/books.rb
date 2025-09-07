# frozen_string_literal: true

FactoryBot.define do
  factory :homebrew_book, class: 'Homebrew::Book' do
    name { 'Book' }
    provider { 'daggerheart' }
    user
  end
end
