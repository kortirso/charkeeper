# frozen_string_literal: true

FactoryBot.define do
  factory :character_companion, class: 'Character::Companion' do
    name { 'Companion' }
    character

    trait :daggerheart do
      type { 'Daggerheart::Character::Companion' }
      data {
        {
          experience: { id: 1, name: 'Scout', level: 2 }
        }
      }
    end
  end
end
