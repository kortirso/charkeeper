# frozen_string_literal: true

FactoryBot.define do
  factory :campaign do
    sequence(:name) { |i| "Campaign #{i}" }
    user

    trait :dnd5 do
      type { 'Dnd5::Campaign' }
    end

    trait :dnd2024 do
      type { 'Dnd2024::Campaign' }
    end

    trait :daggerheart do
      type { 'Daggerheart::Campaign' }
    end

    trait :pathfinder2 do
      type { 'Pathfinder2::Campaign' }
    end
  end
end
