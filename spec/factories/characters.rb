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
          hope_max: 6
        }
      }
    end

    trait :fate do
      type { 'Fate::Character' }
      data { {} }
    end

    trait :cosmere do
      type { 'Cosmere::Character' }
      data {
        {
          'level' => 1,
          'abilities' => { 'str' => 0, 'spd' => 0, 'int' => 0, 'wil' => 0, 'awa' => 0, 'pre' => 0 },
          'health_max' => 10
        }
      }
    end

    trait :cthulhu7 do
      type { 'Cthulhu7::Character' }
      data {
        {
          'abilities' => { 'str' => 0, 'con' => 0, 'siz' => 0, 'dex' => 0, 'app' => 0, 'int' => 0, 'pow' => 0, 'edu' => 0 }
        }
      }
    end
  end
end
