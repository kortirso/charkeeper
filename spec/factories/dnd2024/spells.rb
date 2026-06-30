# frozen_string_literal: true

FactoryBot.define do
  factory :dnd2024_spell, class: 'Feat' do
    type { 'Dnd2024::Feat' }
    sequence(:slug) { |i| "slug-#{i}" }
    title {
      {
        en: 'Name',
        ru: 'Название'
      }
    }
    description {
      {
        en: 'Description',
        ru: 'Описание'
      }
    }
    origin { 6 }
    origin_values { ['bard'] }
    kind { 0 }
    info {
      {
        'level' => 1,
        'time' => 'A',
        'school' => 'divination',
        'range' => 'touch'
      }
    }
  end
end
