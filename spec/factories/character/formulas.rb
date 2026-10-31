# frozen_string_literal: true

FactoryBot.define do
  factory :character_formula, class: 'Character::Formula' do
    character
    item
  end
end
