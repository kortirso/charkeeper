# frozen_string_literal: true

FactoryBot.define do
  factory :campaign_note, class: 'Campaign::Note' do
    title { 'Title' }
    value { 'Note' }
    campaign
  end
end
