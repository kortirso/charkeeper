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
        classes: { 'barbarian' => 4 },
        abilities: { 'mig' => 1, 'agi' => 1, 'int' => 1, 'cha' => 1 }
      }
    }
    user
  end
end
