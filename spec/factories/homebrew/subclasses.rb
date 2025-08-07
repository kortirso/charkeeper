# frozen_string_literal: true

FactoryBot.define do
  factory :homebrew_subclass, class: 'Homebrew::Subclass' do
    name { 'Hedge' }
    class_name { 'Witch' }
    user

    trait :daggerheart do
      type { 'Daggerheart::Homebrew::Subclass' }
      data {
        {}
      }
    end
  end
end
