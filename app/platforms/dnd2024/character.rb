# frozen_string_literal: true

module Dnd2024
  class CharacterData
    include StoreModel::Model

    attribute :level, :integer, default: 1
    attribute :species, :string
    attribute :legacy, :string
    attribute :size, :string
    attribute :alignment, :string
    attribute :main_class, :string
    attribute :classes, array: true
    attribute :subclasses, array: true
    attribute :abilities, array: true, default: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }
    attribute :health, array: true
    attribute :speed, :integer
    attribute :energy, array: true, default: {}
    attribute :selected_skills, array: true, default: [] # ['history']
    attribute :selected_features, array: true, default: {} # { 'fighting_style' => ['fighting_style_defense'] }
    attribute :languages, array: true
    attribute :weapon_core_skills, array: true
    attribute :weapon_skills, array: true
    attribute :armor_proficiency, array: true
    attribute :coins, array: true, default: { gold: 0, silver: 0, copper: 0 }
    attribute :spent_spell_slots, array: true, default: {}
    attribute :spent_hit_dice, array: true, default: {} # потраченные кости хитов
    attribute :tools, array: true, default: [] # владение инструментами
    attribute :music, array: true, default: [] # владение музыкальными инструментами
    attribute :resistance, array: true, default: [] # сопротивления
    attribute :immunity, array: true, default: [] # иммунитеты
    attribute :vulnerability, array: true, default: [] # уязвимости
  end

  class Character < Character
    # species
    HUMAN = 'human'
    DWARF = 'dwarf'
    ELF = 'elf'
    HALFLING = 'halfling'
    DRAGONBORN = 'dragonborn'
    GNOME = 'gnome'
    ORC = 'orc'
    TIEFLING = 'tiefling'
    AASIMAR = 'aasimar'
    GOLIATH = 'goliath'

    # legacies
    HIGH_ELF = 'high_elf'
    WOOD_ELF = 'wood_elf'
    DROW = 'drow'
    FOREST_GNOME = 'forest_gnome'
    ROCK_GNOME = 'rock_gnome'
    CLOUD_GIANT = 'cloud_giant'
    FIRE_GIANT = 'fire_giant'
    FROST_GIANT = 'frost_giant'
    HILL_GIANT = 'hill_giant'
    STONE_GIANT = 'stone_giant'
    STORM_GIANT = 'storm_giant'
    ABYSSAL = 'abyssal'
    CHTHONIC = 'chthonic'
    INFERNAL = 'infernal'

    # sizes
    SMALL = 'small'
    MEDIUM = 'medium'

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
    ARTIFICER = 'artificer'

    # alignment
    LAWFUL_GOOD = 'lawful_good'
    LAWFUL_NEUTRAL = 'lawful_neutral'
    LAWFUL_EVIL = 'lawful_evil'
    NEUTRAL_GOOD = 'neutral_good'
    NEUTRAL = 'neutral'
    NEUTRAL_EVIL = 'neutral_evil'
    CHAOTIC_GOOD = 'chaotic_good'
    CHAOTIC_NEUTRAL = 'chaotic_neutral'
    CHAOTIC_EVIL = 'chaotic_evil'

    # languages
    # common, dwarvish, elvish, giant, gnomish, goblin, halfling, orc, draconic, undercommon, infernal, druidic

    SPECIES = [HUMAN, DWARF, ELF, HALFLING, DRAGONBORN, GNOME, ORC, TIEFLING, AASIMAR, GOLIATH].freeze
    LEGACIES = {
      ELF => [HIGH_ELF, WOOD_ELF, DROW],
      GNOME => [FOREST_GNOME, ROCK_GNOME],
      TIEFLING => [ABYSSAL, CHTHONIC, INFERNAL],
      GOLIATH => [CLOUD_GIANT, FIRE_GIANT, FROST_GIANT, HILL_GIANT, STONE_GIANT, STORM_GIANT]
    }.freeze
    SIZES = {
      HUMAN => [MEDIUM, SMALL],
      DWARF => [MEDIUM],
      ELF => [MEDIUM],
      HALFLING => [SMALL],
      DRAGONBORN => [MEDIUM],
      GNOME => [SMALL],
      ORC => [MEDIUM],
      TIEFLING => [MEDIUM, SMALL],
      AASIMAR => [MEDIUM, SMALL],
      GOLIATH => [MEDIUM]
    }.freeze
    ALIGNMENTS = [
      LAWFUL_GOOD, LAWFUL_NEUTRAL, LAWFUL_EVIL, NEUTRAL_GOOD, NEUTRAL,
      NEUTRAL_EVIL, CHAOTIC_GOOD, CHAOTIC_NEUTRAL, CHAOTIC_EVIL
    ].freeze
    CLASSES = [
      BARBARIAN, BARD, CLERIC, DRUID, FIGHTER, MONK, PALADIN,
      RANGER, ROGUE, SORCERER, WARLOCK, WIZARD, ARTIFICER
    ].freeze

    # бард знает все заклинания, подготавливает новое и/или меняет подготовленное после получения уровня
    # колдун знает все заклинания, подготавливает новое и/или меняет подготовленное после получения уровня
    # чародей знает все заклинания, подготавливает новое и/или меняет подготовленное после получения уровня

    # жрец знает все заклинания, меняет подготовленные после сна
    # друид знает все заклинания, меняет подготовленные после сна
    # изобретатель знает все заклинания, меняет подготовленные после сна

    # следопыт знает все заклинания, меняет 1 подготовленное после сна
    # паладин знает все заклинания, меняет 1 подготовленное после сна

    # волшебник добавляет заклинания в книгу при получении уровня
    # волшебник меняет подготовленные после сна

    # сразу известен весь классовый список заклинаний (все, кроме волшебника)
    CLASSES_KNOW_SPELLS_LIST = [BARD, CLERIC, DRUID, PALADIN, RANGER, SORCERER, WARLOCK, ARTIFICER].freeze

    attribute :data, Dnd2024::CharacterData.to_type

    def decorate
      base_decorator.decorate_character_abilities(character: self)
        .then { |result| species_decorator.decorate_character_abilities(result: result) }
        .then { |result| class_decorator.decorate_character_abilities(result: result) }
        .then { |result| features_decorator.decorate_character_abilities(result: result) }
    end

    def can_learn_spell?(target_spell_class)
      target_spell_class == WIZARD
    end

    def can_prepare_spell?(target_spell_class)
      data.classes.key?(target_spell_class)
    end

    private

    def base_decorator = ::Charkeeper::Container.resolve('decorators.dnd2024_character.base_decorator')
    def species_decorator = ::Charkeeper::Container.resolve('decorators.dnd2024_character.species_wrapper')
    def class_decorator = ::Charkeeper::Container.resolve('decorators.dnd2024_character.class_wrapper')
    def features_decorator = ::Charkeeper::Container.resolve('decorators.dnd2024_character.features')
  end
end
