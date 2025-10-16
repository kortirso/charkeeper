# frozen_string_literal: true

FactoryBot.define do
  factory :homebrew_domain, class: 'Daggerheart::Homebrew::Domain' do
    name { 'dead' }
    user
  end
end
