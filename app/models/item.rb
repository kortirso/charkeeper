# frozen_string_literal: true

class Item < ApplicationRecord
  scope :dnd, -> { where(type: %w[Dnd5::Item Dnd2024::Item]) }
  scope :dnd5, -> { where(type: 'Dnd5::Item') }
  scope :dnd2024, -> { where(type: 'Dnd2024::Item') }
  scope :pathfinder2, -> { where(type: 'Pathfinder2::Item') }
  scope :daggerheart, -> { where(type: 'Daggerheart::Item') }

  has_many :character_items, class_name: 'Character::Item', dependent: :destroy
end
