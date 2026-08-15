# frozen_string_literal: true

FactoryBot.define do
  factory :nimble_character, class: 'Character' do
    type { 'Nimble::Character' }
    sequence(:name) { |i| "Грундар #{i}" }
    data {
      {
        level: 4,
        ancestry: 'human',
        main_class: 'berserker',
        abilities: { 'str' => 2, 'dex' => 2, 'int' => 0, 'wil' => 1 }
      }
    }
    user
  end
end
