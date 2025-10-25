# frozen_string_literal: true

FactoryBot.define do
  factory :spell do
    type { 'Dnd5::Spell' }
    sequence(:slug) { |i| "magic_missile-#{i}" }
    name { { en: 'Magic Missile', ru: 'Волшебная стрела' } }
    data {
      {
        level: 1,
        attacking: true
      }
    }

    trait :dnd2024 do
      type { 'Dnd2024::Spell' }
    end

    trait :daggerheart do
      type { 'Daggerheart::Spell' }
      data {
        {
          level: 1,
          domain: 'bone'
        }
      }
    end
  end
end
