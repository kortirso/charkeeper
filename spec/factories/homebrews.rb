# frozen_string_literal: true

FactoryBot.define do
  factory :homebrew do
    user
    info { {} }

    trait :daggerheart_transformation do
      type { 'Homebrews::Daggerheart::Transformation' }
      title { { 'en' => 'Title' } }
      description { { 'en' => 'Description' } }
    end
  end
end
