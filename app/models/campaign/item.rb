# frozen_string_literal: true

class Campaign
  class Item < ApplicationRecord
    HIDDEN = 'hidden'
    SHARED = 'shared'

    belongs_to :campaign, class_name: '::Campaign'
    belongs_to :item, class_name: '::Item'

    def self.default_states
      { HIDDEN => 0, SHARED => 0 }
    end
  end
end
