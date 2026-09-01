# frozen_string_literal: true

FactoryBot.define do
  factory :pathfinder2_character, class: 'Character' do
    type { 'Pathfinder2::Character' }
    sequence(:name) { |i| "Грундар #{i}" }
    data {
      {
        level: 4,
        race: 'halfling',
        subrace: 'wildwood_halfling',
        main_class: 'witch',
        main_ability: 'int',
        classes: { witch: 4 },
        subclasses: { witch: nil },
        abilities: { str: 13, dex: 16, con: 14, int: 11, wis: 16, cha: 10 },
        speed: 30,
        saving_throws: { fortitude: 0, reflex: 0, will: 0 }
      }
    }
    user
  end
end
