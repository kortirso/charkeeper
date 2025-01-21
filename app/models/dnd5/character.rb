# frozen_string_literal: true

module Dnd5
  class Character < ApplicationRecord
    self.table_name = :dnd5_characters

    # races
    HUMAN = 'human'
    DWARF = 'dwarf'

    # subraces
    # no data

    # alignment
    NEUTRAL = 'neutral'

    has_one :user_character, class_name: '::User::Character', as: :characterable, touch: true, dependent: :destroy

    has_many :spells, class_name: 'Dnd5::Character::Spell', foreign_key: :character_id, dependent: :destroy
    has_many :items, class_name: 'Dnd5::Character::Item', foreign_key: :character_id, dependent: :destroy

    enum :race, { HUMAN => 0, DWARF => 1 }
    enum :alignment, { NEUTRAL => 0 }

    def decorator
      character_decorator = Dnd5::CharacterDecorator.new(data: self)
      race_decorator = Dnd5::RaceDecorator.new(decorator: character_decorator)
      Dnd5::ClassDecorator.new(decorator: race_decorator)
    end
  end
end
