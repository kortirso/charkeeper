# frozen_string_literal: true

class Character
  class Item < ApplicationRecord
    belongs_to :character, class_name: '::Character', touch: true
    belongs_to :item, class_name: '::Item'
  end
end
