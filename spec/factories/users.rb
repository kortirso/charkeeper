# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    sequence(:username) { |i| "user-#{i}" }
    locale { 'ru' }
    password { '1234567890' }
  end
end
