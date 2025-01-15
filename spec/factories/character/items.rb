# frozen_string_literal: true

FactoryBot.define do
  factory :character_item, class: 'Character::Item' do
    quantity { 1 }
    character
    item
  end
end
