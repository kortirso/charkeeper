# frozen_string_literal: true

FactoryBot.define do
  factory :user_feedback, class: 'User::Feedback' do
    value { 'Feedback' }
    user
  end
end
