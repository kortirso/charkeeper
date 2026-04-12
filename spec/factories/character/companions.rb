# frozen_string_literal: true

FactoryBot.define do
  factory :character_companion, class: 'Character::Companion' do
    name { 'Companion' }
    character

    trait :daggerheart do
      type { 'Daggerheart::Character::Companion' }
      data {
        {
          experience: { id: 1, name: 'Scout', level: 2 }
        }
      }
    end

    trait :pathfinder2_pet do
      type { 'Pathfinder2::Character::Pet' }
      data { {} }
    end

    trait :pathfinder2_animal_companion do
      type { 'Pathfinder2::Character::AnimalCompanion' }
      data {
        {
          kind: 'wolf'
        }
      }
    end
  end
end
