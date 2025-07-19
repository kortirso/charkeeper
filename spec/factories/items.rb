# frozen_string_literal: true

FactoryBot.define do
  factory :item do
    type { 'Dnd5::Item' }
    slug { 'torch' }
    name { { en: 'Torch', ru: 'Факел' } }
    kind { 'item' }
    data {
      {
        weight: 1.0,
        price: 1
      }
    }

    trait :daggerheart do
      type { 'Daggerheart::Item' }
      data { {} }
    end
  end
end
