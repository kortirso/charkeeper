# frozen_string_literal: true

FactoryBot.define do
  factory :spell do
    type { 'Dnd5::Spell' }
    slug { 'magic_missile' }
    name { { en: 'Magic Missile', ru: 'Волшебная стрела' } }
    data {
      {
        level: 1,
        attacking: true
      }
    }
  end
end
