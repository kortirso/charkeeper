# frozen_string_literal: true

FactoryBot.define do
  factory :character_feat, class: 'Character::Feat' do
    character
    feat
  end
end
