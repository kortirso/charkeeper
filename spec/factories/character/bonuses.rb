# frozen_string_literal: true

FactoryBot.define do
  factory :character_bonus, class: 'Character::Bonus' do
    value {
      {
        something: 1
      }
    }
    character
  end
end
