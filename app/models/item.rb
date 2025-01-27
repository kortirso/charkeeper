# frozen_string_literal: true

class Item < ApplicationRecord
  scope :dnd5, -> { where(type: 'Dnd5::Item') }
end
