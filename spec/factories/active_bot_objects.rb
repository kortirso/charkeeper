# frozen_string_literal: true

FactoryBot.define do
  factory :active_bot_object do
    source { 'web' }
    object { 'book' }
    user
  end
end
