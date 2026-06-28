# frozen_string_literal: true

FactoryBot.define do
  factory :dnd2024_homebrews_background, class: 'Homebrew' do
    user
    info {
      {
        selected_feats: ["Monk's Focus"],
        selected_skills: %w[acrobatics religion],
        ability_boosts: %w[str int cha]
      }
    }
    type { 'Dnd2024::Homebrews::Background' }
    title { { 'en' => 'Title' } }
    description { { 'en' => 'Description' } }
  end
end
