# frozen_string_literal: true

FactoryBot.define do
  factory :homebrew_transformation, class: 'Daggerheart::Homebrew::Transformation' do
    name { 'Vampire' }
    user
  end
end
