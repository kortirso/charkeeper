# frozen_string_literal: true

FactoryBot.define do
  factory :item_recipe, class: 'Item::Recipe' do
    tool factory: :item
    item
  end
end
