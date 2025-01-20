# frozen_string_literal: true

FactoryBot.define do
  factory :user_character, class: 'User::Character' do
    user
    characterable factory: :dnd5_character
  end
end
