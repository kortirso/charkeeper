# frozen_string_literal: true

FactoryBot.define do
  factory :homebrew do
    user
    info { {} }

    trait :daggerheart_transformation do
      type { 'Daggerheart::Homebrews::Transformation' }
      title { { 'en' => 'Title' } }
      description { { 'en' => 'Description' } }
    end

    trait :daggerheart_ancestry do
      type { 'Daggerheart::Homebrews::Ancestry' }
      title { { 'en' => 'Title' } }
      description { { 'en' => 'Description' } }
    end
  end
end
