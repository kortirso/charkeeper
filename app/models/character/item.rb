# frozen_string_literal: true

class Character
  class Item < ApplicationRecord
    belongs_to :character, class_name: '::Character', touch: true
    belongs_to :item, class_name: '::Item'

    scope :ready_to_use, -> { where(ready_to_use: true) }
  end
end
