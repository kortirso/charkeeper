# frozen_string_literal: true

class Character < ApplicationRecord
  has_one_attached :avatar
  has_one_attached :temp_avatar

  belongs_to :user

  has_many :spells, class_name: '::Character::Spell', dependent: :destroy
  has_many :items, class_name: '::Character::Item', dependent: :destroy
  has_many :notes, class_name: '::Character::Note', dependent: :destroy
  has_many :bonuses, class_name: '::Character::Bonus', dependent: :destroy
  has_many :feats, class_name: '::Character::Feat', dependent: :destroy
  has_one :companion, class_name: '::Character::Companion', dependent: :destroy

  scope :dnd, -> { where(type: %w[Dnd5::Character Dnd2024::Character]) }
  scope :dnd5, -> { where(type: 'Dnd5::Character') }
  scope :dnd2024, -> { where(type: 'Dnd2024::Character') }
  scope :pathfinder2, -> { where(type: 'Pathfinder2::Character') }
  scope :daggerheart, -> { where(type: 'Daggerheart::Character') }

  def decorator = raise NotImplementedError
end
