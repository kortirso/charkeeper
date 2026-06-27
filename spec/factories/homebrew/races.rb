# frozen_string_literal: true

FactoryBot.define do
  factory :homebrew_race, class: 'Homebrew::Race' do
    name { 'Race' }
    user

    trait :dnd2024 do
      type { 'Dnd2024::Homebrew::Race' }
      data { {} }
    end
  end
end
