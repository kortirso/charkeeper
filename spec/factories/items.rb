# frozen_string_literal: true

FactoryBot.define do
  factory :item do
    kind { 'item' }
    name { { en: 'Torch', ru: 'Факел' } }
    weight { 1.0 }
    price { 1 }
    rule
  end
end
