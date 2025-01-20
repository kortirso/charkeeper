# frozen_string_literal: true

module Dnd5
  class Character
    class Item < ApplicationRecord
      self.table_name = :dnd5_character_items

      belongs_to :character, class_name: '::Dnd5::Character'
      belongs_to :item, class_name: '::Dnd5::Item'
    end
  end
end
