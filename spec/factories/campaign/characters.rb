# frozen_string_literal: true

FactoryBot.define do
  factory :campaign_character, class: 'Campaign::Character' do
    campaign
    character
  end
end
