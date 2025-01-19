# frozen_string_literal: true

FactoryBot.define do
  factory :character_spell, class: 'Character::Spell' do
    character
    spell
  end
end
