# frozen_string_literal: true

FactoryBot.define do
  factory :dnd5_spell, class: 'Dnd5::Spell' do
    slug { 'magic_missle' }
    name { { en: 'Magic Missile', ru: 'Волшебная стрела' } }
    level { 1 }
    attacking { true }
  end
end
