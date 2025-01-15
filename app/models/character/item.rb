# frozen_string_literal: true

class Character
  class Item < ApplicationRecord
    belongs_to :character
    belongs_to :item
  end
end
