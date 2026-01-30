# frozen_string_literal: true

class Spell < ApplicationRecord
  include Itemable

  scope :dnd5, -> { where(type: 'Dnd5::Spell') }

  has_many :character_spells, class_name: '::Character::Spell', dependent: :destroy
end
