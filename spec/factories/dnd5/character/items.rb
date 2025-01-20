# frozen_string_literal: true

FactoryBot.define do
  factory :dnd5_character_item, class: 'Dnd5::Character::Item' do
    quantity { 1 }
    character factory: :dnd5_character
    item factory: :dnd5_item
  end
end
