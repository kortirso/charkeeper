# frozen_string_literal: true

module Dnd5
  class Character
    class Spell < ApplicationRecord
      self.table_name = :dnd5_character_spells

      belongs_to :character, class_name: '::Dnd5::Character'
      belongs_to :spell, class_name: '::Dnd5::Spell'

      enum :prepared_by, {
        Dnd5::Character::SORCERER => 0, Dnd5::Character::DRUID => 1, Dnd5::Character::BARD => 2,
        Dnd5::Character::CLERIC => 3, Dnd5::Character::PALADIN => 4, Dnd5::Character::RANGER => 5,
        Dnd5::Character::WARLOCK => 6, Dnd5::Character::WIZARD => 7
      }
    end
  end
end
