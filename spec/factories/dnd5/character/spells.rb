# frozen_string_literal: true

FactoryBot.define do
  factory :dnd5_character_spell, class: 'Dnd5::Character::Spell' do
    character factory: :dnd5_character
    spell factory: :dnd5_spell
  end
end
