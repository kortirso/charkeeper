# frozen_string_literal: true

FactoryBot.define do
  factory :user_identity, class: 'User::Identity' do
    provider { User::Identity::TELEGRAM }
    uid { '1234567890' }
    username { 'login' }
    user
  end
end
