# frozen_string_literal: true

FactoryBot.define do
  factory :homebrew_race, class: 'Homebrew::Race' do
    name { 'Race' }
    user

    trait :daggerheart do
      type { 'Daggerheart::Homebrew::Race' }
      data { {} }
    end
  end
end
