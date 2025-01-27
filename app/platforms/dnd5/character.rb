# frozen_string_literal: true

module Dnd5
  class CharacterData
    include StoreModel::Model

    attribute :level, :integer
    attribute :race, :string
    attribute :alignment, :string
    attribute :main_class, :string
    attribute :classes, array: true
    attribute :subclasses, array: true
    attribute :abilities, array: true
    attribute :health, array: true
    attribute :energy, array: true
    attribute :speed, :integer
    attribute :selected_skills, array: true
    attribute :class_features, array: true
    attribute :languages, array: true
    attribute :weapon_core_skills, array: true
    attribute :weapon_skills, array: true
    attribute :armor_proficiency, array: true
    attribute :coins, array: true
    attribute :spent_spell_slots, array: true
  end

  class Character < Character
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

    BATTLE_MASTER = 'battle_master'

    # alignment
    NEUTRAL = 'neutral'

    RACES = [HUMAN, DWARF, ELF].freeze
    ALIGNMENTS = [NEUTRAL].freeze
    CLASSES = [BARBARIAN, BARD, CLERIC, DRUID, FIGHTER, MONK, PALADIN, RANGER, ROGUE, SORCERER, WARLOCK, WIZARD].freeze
    SUBCLASSES = {
      FIGHTER: [BATTLE_MASTER]
    }.freeze

    CLASSES_LEARN_SPELLS = [BARD, RANGER, SORCERER, WARLOCK, WIZARD].freeze
    CLASSES_PREPARE_SPELLS = [CLERIC, DRUID, PALADIN, WIZARD].freeze

    attribute :data, Dnd5::CharacterData.to_type

    def decorator
      character_decorator = Dnd5::CharacterDecorator.new(character: self)
      race_decorator = Dnd5::RaceDecorator.new(decorator: character_decorator)
      Dnd5::ClassDecorator.new(decorator: race_decorator)
    end

    def can_learn_spell?(target_spell_class)
      return false if data.classes.keys.exclude?(target_spell_class)
      return false if CLASSES_LEARN_SPELLS.exclude?(target_spell_class)

      true
    end

    def can_prepare_spell?(target_spell_class)
      return false if data.classes.keys.exclude?(target_spell_class)
      return false if CLASSES_PREPARE_SPELLS.exclude?(target_spell_class)

      true
    end
  end
end
