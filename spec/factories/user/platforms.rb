# frozen_string_literal: true

FactoryBot.define do
  factory :user_platform, class: 'User::Platform' do
    sequence(:name) { |i| i }
    user
  end
end
