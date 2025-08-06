# frozen_string_literal: true

class Campaign < ApplicationRecord
  scope :dnd5, -> { where(type: 'Dnd5::Feat') }
  scope :dnd2024, -> { where(type: 'Dnd2024::Feat') }
  scope :pathfinder2, -> { where(type: 'Pathfinder2::Feat') }
  scope :daggerheart, -> { where(type: 'Daggerheart::Feat') }

  belongs_to :user

  has_many :campaign_characters, class_name: 'Campaign::Character', dependent: :destroy
  has_many :characters, through: :campaign_characters
end
