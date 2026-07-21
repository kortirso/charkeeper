# frozen_string_literal: true

FactoryBot.define do
  factory :dc20_character, class: 'Character' do
    type { 'Dc20::Character' }
    sequence(:name) { |i| "Грундар #{i}" }
    data {
      {
        level: 4,
        ancestry: 'human',
        main_class: 'barbarian',
        classes: { barbarian: 4 }
      }
    }
    user
  end
end
