# frozen_string_literal: true

FactoryBot.define do
  factory :homebrew do
    user
    info { {} }
    type { 'Daggerheart::Homebrews::Ancestry' }

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

    trait :daggerheart_community do
      type { 'Daggerheart::Homebrews::Community' }
      title { { 'en' => 'Title' } }
      description { { 'en' => 'Description' } }
    end

    trait :daggerheart_class do
      type { 'Daggerheart::Homebrews::Speciality' }
      title { { 'en' => 'Title' } }
      description { { 'en' => 'Description' } }
      info { { 'domains' => %w[codex bone], 'evasion' => 5, 'health_max' => 5 } }
    end

    trait :daggerheart_subclass do
      type { 'Daggerheart::Homebrews::Subclass' }
      title { { 'en' => 'Title' } }
      description { { 'en' => 'Description' } }
      info { { 'class_id' => '1' } }
    end

    trait :daggerheart_domain do
      type { 'Daggerheart::Homebrews::Domain' }
      title { { 'en' => 'Title' } }
      description { { 'en' => 'Description' } }
    end
  end
end
