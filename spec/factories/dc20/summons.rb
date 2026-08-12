# frozen_string_literal: true

FactoryBot.define do
  factory :dc20_summon, class: 'Character' do
    type { 'Dc20::Summon' }
    parent factory: :character
    sequence(:name) { |i| "Вурдалак #{i}" }
    data {
      {
        'kind' => 'undead',
        'ancestry_features' => { 'keen_senses' => 2 }
      }
    }
    user
  end
end
