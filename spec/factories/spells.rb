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
