# frozen_string_literal: true

FactoryBot.define do
  factory :dnd2024_character, class: 'Character' do
    type { 'Dnd2024::Character' }
    sequence(:name) { |i| "Грундар #{i}" }
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
    user
  end
end
