# frozen_string_literal: true

FactoryBot.define do
  factory :pathfinder2_spell, class: 'Feat' do
    type { 'Pathfinder2::Feat' }
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
    origin { 4 }
    origin_value { 'ahcestry' }
    origin_values { ['bard'] }
    kind { 0 }
    info {
      {
        'level' => 1,
        'time' => 'A',
        'range' => 'touch'
      }
    }
  end
end
