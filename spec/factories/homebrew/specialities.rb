# frozen_string_literal: true

FactoryBot.define do
  factory :homebrew_speciality, class: 'Homebrew::Speciality' do
    name { 'Witch' }
    user

    trait :cosmere do
      type { 'Cosmere::Homebrew::Speciality' }
      data {
        { names: {}, descriptions: {} }
      }
    end
  end
end
