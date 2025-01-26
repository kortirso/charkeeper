# frozen_string_literal: true

module Dnd5
  class Character < ApplicationRecord
    self.table_name = :dnd5_characters

    # races
    HUMAN = 'human'
    DWARF = 'dwarf'
    ELF = 'elf'

    # subraces
    # no data

    # classes
    BARBARIAN = 'barbarian'
    BARD = 'bard'
    CLERIC = 'cleric'
    DRUID = 'druid'
    FIGHTER = 'fighter'
    MONK = 'monk'
    PALADIN = 'paladin'
    RANGER = 'ranger'
    ROGUE = 'rogue'
    SORCERER = 'sorcerer'
    WARLOCK = 'warlock'
    WIZARD = 'wizard'

    # alignment
    NEUTRAL = 'neutral'

    CLASSES_LEARN_SPELLS = [BARD, RANGER, SORCERER, WARLOCK, WIZARD].freeze
    CLASSES_PREPARE_SPELLS = [CLERIC, DRUID, PALADIN, WIZARD].freeze

    has_one :user_character, class_name: '::User::Character', as: :characterable, touch: true, dependent: :destroy

    has_many :spells, class_name: 'Dnd5::Character::Spell', foreign_key: :character_id, dependent: :destroy
    has_many :items, class_name: 'Dnd5::Character::Item', foreign_key: :character_id, dependent: :destroy

    enum :race, { HUMAN => 0, DWARF => 1, ELF => 2 }
    enum :main_class, {
      BARBARIAN => 0, BARD => 1, CLERIC => 2, DRUID => 3, FIGHTER => 4, MONK => 5, PALADIN => 6,
      RANGER => 7, ROGUE => 8, SORCERER => 9, WARLOCK => 10, WIZARD => 11
    }
    enum :alignment, { NEUTRAL => 0 }

    def decorator
      character_decorator = Dnd5::CharacterDecorator.new(data: self)
      race_decorator = Dnd5::RaceDecorator.new(decorator: character_decorator)
      Dnd5::ClassDecorator.new(decorator: race_decorator)
    end

    def can_learn_spell?(target_spell_class)
      return false if classes.keys.exclude?(target_spell_class)
      return false if CLASSES_LEARN_SPELLS.exclude?(target_spell_class)

      true
    end

    def can_prepare_spell?(target_spell_class)
      return false if classes.keys.exclude?(target_spell_class)
      return false if CLASSES_PREPARE_SPELLS.exclude?(target_spell_class)

      true
    end
  end
end
