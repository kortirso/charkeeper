# frozen_string_literal: true

FactoryBot.define do
  factory :notification do
    value { 'Value' }
    locale { 'en' }
    targets { %w[telegram] }
  end
end
