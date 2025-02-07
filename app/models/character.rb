# frozen_string_literal: true

class Character < ApplicationRecord
  belongs_to :user

  has_many :spells, class_name: '::Character::Spell', dependent: :destroy
  has_many :items, class_name: '::Character::Item', dependent: :destroy
  has_many :notes, class_name: '::Character::Note', dependent: :destroy

  scope :dnd5, -> { where(type: 'Dnd5::Character') }

  def decorator = raise NotImplementedError
end
