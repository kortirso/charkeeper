# frozen_string_literal: true

FactoryBot.define do
  factory :character_item, class: 'Character::Item' do
    states { Character::Item.default_states }
    state { 'hands' }
    character
    item
  end
end
