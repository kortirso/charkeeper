# frozen_string_literal: true

FactoryBot.define do
  factory :character_resource, class: 'Character::Resource' do
    value { 1 }
    character
    custom_resource
  end
end
