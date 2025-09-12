# frozen_string_literal: true

FactoryBot.define do
  factory :homebrew_community, class: 'Homebrew::Community' do
    name { 'Community' }
    user

    trait :daggerheart do
      type { 'Daggerheart::Homebrew::Community' }
    end
  end
end
