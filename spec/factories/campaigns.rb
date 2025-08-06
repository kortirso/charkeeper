# frozen_string_literal: true

FactoryBot.define do
  factory :campaign do
    sequence(:name) { |i| "Campaign #{i}" }
    user

    trait :dnd5 do
      provider { 'dnd5' }
    end

    trait :dnd2024 do
      provider { 'dnd2024' }
    end

    trait :daggerheart do
      provider { 'daggerheart' }
    end

    trait :pathfinder2 do
      provider { 'pathfinder2' }
    end
  end
end
