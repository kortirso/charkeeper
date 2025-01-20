# frozen_string_literal: true

module Dnd5
  class Character
    class Spell < ApplicationRecord
      self.table_name = :dnd5_character_spells

      SORCERER = 'sorcerer'

      belongs_to :character, class_name: '::Dnd5::Character'
      belongs_to :spell, class_name: '::Dnd5::Spell'

      enum :prepared_by, { SORCERER => 0 }
    end
  end
end
