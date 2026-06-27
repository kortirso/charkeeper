# frozen_string_literal: true

FactoryBot.define do
  factory :dnd2024_feat, class: 'Feat' do
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
    origin { 4 }
    origin_value { 'origin' }
    kind { 0 }
    conditions { { 'level' => 1 } }
  end
end
