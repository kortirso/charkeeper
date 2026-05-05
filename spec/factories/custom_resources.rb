# frozen_string_literal: true

FactoryBot.define do
  factory :custom_resource do
    sequence(:name) { |i| "Resource #{i}" }
    resourceable factory: :campaign
  end
end
