# frozen_string_literal: true

class Campaign < ApplicationRecord
  belongs_to :user

  has_many :campaign_characters, class_name: 'Campaign::Character', dependent: :destroy
  has_many :characters, through: :campaign_characters

  has_many :campaign_channels, class_name: 'Campaign::Channel', dependent: :destroy
  has_many :channels, through: :campaign_channels

  scope :dnd5, -> { where(provider: 'dnd5') }
  scope :dnd2024, -> { where(provider: 'dnd2024') }
  scope :pathfinder2, -> { where(provider: 'pathfinder2') }
  scope :daggerheart, -> { where(provider: 'daggerheart') }
end
