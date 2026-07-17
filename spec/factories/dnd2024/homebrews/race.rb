# frozen_string_literal: true

FactoryBot.define do
  factory :dnd2024_homebrews_race, class: 'Homebrew' do
    user
    info {
      {}
    }
    type { 'Dnd2024::Homebrews::Race' }
    title { { 'en' => 'Title' } }
    description { { 'en' => 'Description' } }
  end
end
