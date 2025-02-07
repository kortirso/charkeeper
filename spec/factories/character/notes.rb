# frozen_string_literal: true

FactoryBot.define do
  factory :character_note, class: 'Character::Note' do
    title { 'Title' }
    value { 'Note' }
    character
  end
end
