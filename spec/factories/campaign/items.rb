# frozen_string_literal: true

FactoryBot.define do
  factory :campaign_item, class: 'Campaign::Item' do
    campaign
    item
  end
end
