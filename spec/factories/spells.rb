# frozen_string_literal: true

FactoryBot.define do
  factory :spell do
    slug { 'magic_missle' }
    name { { en: 'Magic Missile', ru: 'Волшебная стрела' } }
    level { 1 }
    attacking { true }
    rule
  end
end
