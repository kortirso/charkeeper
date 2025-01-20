# frozen_string_literal: true

FactoryBot.define do
  factory :dnd5_character, class: 'Dnd5::Character' do
    name { 'Грундар' }
    level { 4 }
    race { Dnd5::Character::HUMAN }
    alignment { Dnd5::Character::NEUTRAL }
    classes { { monk: 4 } }
    subclasses { { monk: nil } }
    abilities { { str: 13, dex: 16, con: 14, int: 11, wis: 16, cha: 10 } }
    speed { 30 }
  end
end
