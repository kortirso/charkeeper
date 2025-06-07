# frozen_string_literal: true

FactoryBot.define do
  factory :character do
    type { 'Dnd5::Character' }
    name { 'Грундар' }
    data {
      {
        level: 4,
        race: Dnd5::Character::HUMAN,
        alignment: Dnd5::Character::NEUTRAL,
        main_class: Dnd5::Character::MONK,
        classes: { monk: 4 },
        subclasses: { monk: nil },
        abilities: { str: 13, dex: 16, con: 14, int: 11, wis: 16, cha: 10 },
        speed: 30,
        selected_skills: %w[history]
      }
    }
    user

    trait :dnd2024 do
      type { 'Dnd2024::Character' }
    end

    trait :pathfinder2 do
      type { 'Pathfinder2::Character' }
      data {
        {
          level: 4,
          race: 'halfling',
          subrace: 'wildwood_halfling',
          main_class: 'witch',
          classes: { witch: 4 },
          subclasses: { witch: nil },
          abilities: { str: 13, dex: 16, con: 14, int: 11, wis: 16, cha: 10 },
          speed: 30,
          saving_throws: { fortitude: 0, reflex: 0, will: 0 }
        }
      }
    end
  end
end
