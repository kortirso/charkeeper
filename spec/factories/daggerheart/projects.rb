# frozen_string_literal: true

FactoryBot.define do
  factory :daggerheart_project, class: 'Daggerheart::Project' do
    title { "Studying 'Whispers of Stone'" }
    description { 'Practicing sensing ground vibrations to detect hidden threats. Gain new experience: You can spend Hope to add this bonus to perception rolls while touching the ground.' } # rubocop: disable Layout/LineLength
    complexity { 4 }
    character
  end
end
