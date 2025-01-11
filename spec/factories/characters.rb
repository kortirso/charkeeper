# frozen_string_literal: true

FactoryBot.define do
  factory :character do
    name { 'Kormak' }
    data { { abilities: { str: 16 }, classes: { warrior: 1 } } }
    rule
    user
  end
end
