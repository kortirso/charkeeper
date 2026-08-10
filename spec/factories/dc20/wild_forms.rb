# frozen_string_literal: true

FactoryBot.define do
  factory :dc20_wild_form, class: 'Character' do
    type { 'Dc20::WildForm' }
    parent factory: :character
    sequence(:name) { |i| "Медведь #{i}" }
    data {
      {
        'ancestry_features' => { 'keen_senses' => 2 }
      }
    }
    user
  end
end
