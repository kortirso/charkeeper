# frozen_string_literal: true

FactoryBot.define do
  factory :campaign do
    sequence(:name) { |i| "Campaign #{i}" }
    user
  end
end
