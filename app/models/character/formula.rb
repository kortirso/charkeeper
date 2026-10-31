# frozen_string_literal: true

class Character
  class Formula < ApplicationRecord
    belongs_to :character, class_name: '::Character'
    belongs_to :item, class_name: '::Item'
  end
end
