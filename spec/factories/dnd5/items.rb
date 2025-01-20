# frozen_string_literal: true

FactoryBot.define do
  factory :dnd5_item, class: 'Dnd5::Item' do
    kind { 'item' }
    name { { en: 'Torch', ru: 'Факел' } }
    weight { 1.0 }
    price { 1 }
  end
end
