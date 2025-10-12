# frozen_string_literal: true

FactoryBot.define do
  factory :channel do
    provider { 'telegram' }
    external_id { '1234567890' }
  end
end
