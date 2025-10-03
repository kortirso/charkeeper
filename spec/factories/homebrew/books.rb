# frozen_string_literal: true

FactoryBot.define do
  factory :homebrew_book, class: 'Homebrew::Book' do
    name { 'Book' }
    provider { 'daggerheart' }
    shared { false }
    user

    trait :dnd2024 do
      provider { 'dnd2024' }
    end
  end
end
