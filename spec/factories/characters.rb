# frozen_string_literal: true

FactoryBot.define do
  factory :character do
    type { 'Dnd5::Character' }
    sequence(:name) { |i| "Грундар #{i}" }
    data {
      {
        level: 4,
        race: 'human',
        alignment: Dnd5::Character::NEUTRAL,
        main_class: 'monk',
        classes: { monk: 4 },
        subclasses: { monk: nil },
        abilities: { str: 13, dex: 16, con: 14, int: 11, wis: 16, cha: 10 },
        speed: 30,
        selected_skills: %w[history]
      }
    }
    user

    trait :bard do
      data {
        {
          level: 4,
          race: 'human',
          alignment: Dnd5::Character::NEUTRAL,
          main_class: 'bard',
          classes: { bard: 4 },
          subclasses: { bard: nil },
          abilities: { str: 13, dex: 16, con: 14, int: 11, wis: 16, cha: 10 },
          speed: 30,
          selected_skills: %w[history]
        }
      }
    end

    trait :dnd2024 do
      type { 'Dnd2024::Character' }
      data {
        {
          level: 4,
          species: 'human',
          alignment: Dnd5::Character::NEUTRAL,
          main_class: 'bard',
          classes: { bard: 4 },
          subclasses: { bard: nil },
          abilities: { str: 13, dex: 16, con: 14, int: 11, wis: 16, cha: 10 },
          speed: 30,
          selected_skills: { 'history' => 1 }
        }
      }
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

    trait :daggerheart do
      type { 'Daggerheart::Character' }
      data {
        {
          level: 4,
          heritage: 'halfling',
          community: 'highborne',
          main_class: 'bard',
          classes: { bard: 4 },
          subclasses: { bard: 'wordsmith' },
          subclasses_mastery: { wordsmith: 2 },
          traits: { str: 1, agi: 2, fin: 1, ins: 0, pre: 0, know: -1 },
          evasion: 10,
          health_max: 5,
          stress_max: 6,
          hope_max: 6,
          leveling: { evasion: 1, health: 1 }
        }
      }
    end
  end
end
