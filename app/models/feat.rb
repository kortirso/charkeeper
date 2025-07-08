# frozen_string_literal: true

class Feat < ApplicationRecord
  scope :dnd5, -> { where(type: 'Dnd5::Feat') }
  scope :dnd2024, -> { where(type: 'Dnd2024::Feat') }
  scope :pathfinder2, -> { where(type: 'Pathfinder2::Feat') }
  scope :daggerheart, -> { where(type: 'Daggerheart::Feat') }

  has_many :character_feats, class_name: 'Character::Feat', dependent: :destroy
end
