# frozen_string_literal: true

class Item < ApplicationRecord
  belongs_to :user, optional: true
  belongs_to :itemable, polymorphic: true, optional: true

  has_many :character_items, class_name: '::Character::Item', dependent: :destroy
  has_many :bonuses, class_name: '::Character::Bonus', as: :bonusable, dependent: :destroy

  scope :dnd, -> { where(type: %w[Dnd5::Item Dnd2024::Item]) }
  scope :dnd5, -> { where(type: 'Dnd5::Item') }
  scope :dnd2024, -> { where(type: 'Dnd2024::Item') }
  scope :pathfinder2, -> { where(type: 'Pathfinder2::Item') }
  scope :daggerheart, -> { where(type: 'Daggerheart::Item') }
  scope :dc20, -> { where(type: 'Dc20::Item') }

  scope :visible, -> { where(itemable: nil) }
end
