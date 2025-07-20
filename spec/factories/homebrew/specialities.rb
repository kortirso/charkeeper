# frozen_string_literal: true

FactoryBot.define do
  factory :homebrew_speciality, class: 'Homebrew::Speciality' do
    name { 'Witch' }
    user

    trait :daggerheart do
      type { 'Daggerheart::Homebrew::Speciality' }
      data {
        { evasion: 10, health_max: 6, domains: %w[codex grace] }
      }
    end
  end
end
