# frozen_string_literal: true

class Character
  class Item < ApplicationRecord
    HANDS = 'hands'
    EQUIPMENT = 'equipment'
    BACKPACK = 'backpack'
    STORAGE = 'storage'
    ACTIVE_STATES = [HANDS, EQUIPMENT].freeze

    belongs_to :character, class_name: '::Character', touch: :equipment_updated_at
    belongs_to :item, class_name: '::Item'

    enum :state, { HANDS => 0, EQUIPMENT => 1, BACKPACK => 2, STORAGE => 3 }

    scope :ready_to_use, -> { where(ready_to_use: true) }
    scope :active_states, -> { where(state: ACTIVE_STATES) }

    def self.default_states
      states.keys.index_with { 0 }
    end
  end
end
