# frozen_string_literal: true

class Character
  class Feat < ApplicationRecord
    belongs_to :character, class_name: '::Character'
    belongs_to :feat, class_name: '::Feat'

    scope :ready_to_use, -> { where(ready_to_use: true) }
  end
end
