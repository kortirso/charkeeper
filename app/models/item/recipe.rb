# frozen_string_literal: true

class Item
  class Recipe < ApplicationRecord
    belongs_to :tool, class_name: 'Item', foreign_key: :tool_id
    belongs_to :item
  end
end
