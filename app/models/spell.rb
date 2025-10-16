# frozen_string_literal: true

class Spell < ApplicationRecord
  include Itemable

  scope :dnd5, -> { where(type: 'Dnd5::Spell') }
  scope :dnd2024, -> { where(type: 'Dnd2024::Spell') }
end
