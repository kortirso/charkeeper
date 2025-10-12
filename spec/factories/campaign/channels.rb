# frozen_string_literal: true

FactoryBot.define do
  factory :campaign_channel, class: 'Campaign::Channel' do
    campaign
    channel
  end
end
