# frozen_string_literal: true

FactoryBot.define do
  factory :user_notification, class: 'User::Notification' do
    title { 'Title' }
    value { 'Feedback' }
    user
  end
end
