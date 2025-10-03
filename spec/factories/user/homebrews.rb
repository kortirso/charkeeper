# frozen_string_literal: true

FactoryBot.define do
  factory :user_homebrew, class: 'User::Homebrew' do
    data { {} }
    user
  end
end
