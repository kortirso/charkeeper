# frozen_string_literal: true

class Item < ApplicationRecord
  scope :dnd5, -> { where(type: 'Dnd5::Item') }

  has_many :character_items, class_name: 'Character::Item', dependent: :destroy
end
