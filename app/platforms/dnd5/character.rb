# frozen_string_literal: true

module Dnd5
  class CharacterData
    include StoreModel::Model

    attribute :level, :integer, default: 1
    attribute :race, :string
    attribute :subrace, :string
    attribute :alignment, :string
    attribute :main_class, :string
    attribute :classes, array: true
    attribute :subclasses, array: true
    attribute :abilities, array: true, default: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }
    attribute :health, array: true
    attribute :speed, :integer
    attribute :energy, array: true, default: {}
    attribute :selected_skills, array: true, default: [] # ['history']
    attribute :selected_features, array: true, default: {} # { 'fighting_style' => ['defense'] }
    attribute :languages, array: true
    attribute :weapon_core_skills, array: true
    attribute :weapon_skills, array: true
    attribute :armor_proficiency, array: true
    attribute :coins, array: true, default: { gold: 0, silver: 0, copper: 0 }
    attribute :spent_spell_slots, array: true, default: {}
  end

  class Character < Character
    # races
    HUMAN = 'human'
    DWARF = 'dwarf'
    ELF = 'elf'
    HALFLING = 'halfling'
    DRAGONBORN = 'dragonborn'
    GNOME = 'gnome'
    HALF_ELF = 'half_elf'
    HALF_ORC = 'half_orc'
    TIEFLING = 'tiefling'

    # subraces
    MOUNTAIN_DWARF = 'mountain_dwarf'
    HILL_DWARF = 'hill_dwarf'
    HIGH_ELF = 'high_elf'
    WOOD_ELF = 'wood_elf'
    DROW = 'drow'
    LIGHTFOOT = 'lightfoot'
    STOUT = 'stout'
    FOREST_GNOME = 'forest_gnome'
    ROCK_GNOME = 'rock_gnome'

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

    PATH_OF_THE_BERSERKER = 'path_of_the_berserker'
    PATH_OF_THE_TOTEM_WARRIOR = 'path_of_the_totem_warrior'
    COLLEGE_OF_LORE = 'college_of_lore'
    COLLEGE_OF_VALOR = 'college_of_valor'
    COLLEGE_OF_WHISPERS = 'college_of_whispers'
    KNOWLEDGE_DOMAIN = 'knowledge_domain'
    LIFE_DOMAIN = 'life_domain'
    LIGHT_DOMAIN = 'light_domain'
    NATURE_DOMAIN = 'nature_domain'
    TEMPEST_DOMAIN = 'tempest_domain'
    TRICKERY_DOMAIN = 'trickery_domain'
    WAR_DOMAIN = 'war_domain'
    CIRCLE_OF_THE_LAND = 'circle_of_the_land'
    CIRCLE_OF_THE_MOON = 'circle_of_the_moon'
    CHAMPION = 'champion'
    BATTLE_MASTER = 'battle_master'
    ELDRITCH_KNIGHT = 'eldritch_knight'
    WAY_OF_THE_OPEN_HAND = 'way_of_the_open_hand'
    WAY_OF_SHADOW = 'way_of_shadow'
    WAY_OF_THE_FOUR_ELEMENTS = 'way_of_the_four_elements'
    OATH_OF_DEVOTION = 'oath_of_devotion'
    OATH_OF_THE_ANCIENTS = 'oath_of_the_ancients'
    OATH_OF_VENGEANCE = 'oath_of_vengeance'
    HUNTER = 'hunter'
    BEAST_MASTER = 'beast_master'
    THIEF = 'thief'
    ASSASSIN = 'assassin'
    ARCANE_TRICKSTER = 'arcane_trickster'
    DRACONIC_BLOODLINE = 'draconic_bloodline'
    WILD_MAGIC = 'wild_magic'
    THE_ARCHFEY = 'the_archfey'
    THE_FIEND = 'the_fiend'
    THE_GREAT_OLD_ONE = 'the_great_old_one'
    SCHOOL_OF_ABJURATION = 'school_of_abjuration'
    SCHOOL_OF_CONJURATION = 'school_of_conjuration'
    SCHOOL_OF_DIVINATION = 'school_of_divination'
    SCHOOL_OF_ENCHANTMENT = 'school_of_enchantment'
    SCHOOL_OF_EVOCATION = 'school_of_evocation'
    SCHOOL_OF_ILLUSION = 'school_of_illusion'
    SCHOOL_OF_NECROMANCY = 'school_of_necromancy'
    SCHOOL_OF_TRANSMUTATION = 'school_of_transmutation'
    ALCHEMIST = 'alchemist'

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

    RACES = [HUMAN, DWARF, ELF, HALFLING, DRAGONBORN, GNOME, HALF_ELF, HALF_ORC, TIEFLING].freeze
    SUBRACES = {
      DWARF => [MOUNTAIN_DWARF, HILL_DWARF],
      ELF => [HIGH_ELF, WOOD_ELF, DROW],
      HALFLING => [LIGHTFOOT, STOUT],
      GNOME => [FOREST_GNOME, ROCK_GNOME]
    }.freeze
    ALIGNMENTS = [
      LAWFUL_GOOD, LAWFUL_NEUTRAL, LAWFUL_EVIL, NEUTRAL_GOOD, NEUTRAL,
      NEUTRAL_EVIL, CHAOTIC_GOOD, CHAOTIC_NEUTRAL, CHAOTIC_EVIL
    ].freeze
    CLASSES = [
      BARBARIAN, BARD, CLERIC, DRUID, FIGHTER, MONK, PALADIN,
      RANGER, ROGUE, SORCERER, WARLOCK, WIZARD, ARTIFICER
    ].freeze
    SUBCLASSES = {
      BARBARIAN => [PATH_OF_THE_BERSERKER, PATH_OF_THE_TOTEM_WARRIOR],
      BARD => [COLLEGE_OF_LORE, COLLEGE_OF_VALOR, COLLEGE_OF_WHISPERS],
      CLERIC => [KNOWLEDGE_DOMAIN, LIFE_DOMAIN, LIGHT_DOMAIN, NATURE_DOMAIN, TEMPEST_DOMAIN, TRICKERY_DOMAIN, WAR_DOMAIN],
      DRUID => [CIRCLE_OF_THE_LAND, CIRCLE_OF_THE_MOON],
      FIGHTER => [CHAMPION, BATTLE_MASTER, ELDRITCH_KNIGHT],
      MONK => [WAY_OF_THE_OPEN_HAND, WAY_OF_SHADOW, WAY_OF_THE_FOUR_ELEMENTS],
      PALADIN => [OATH_OF_DEVOTION, OATH_OF_THE_ANCIENTS, OATH_OF_VENGEANCE],
      RANGER => [HUNTER, BEAST_MASTER],
      ROGUE => [THIEF, ASSASSIN, ARCANE_TRICKSTER],
      SORCERER => [DRACONIC_BLOODLINE, WILD_MAGIC],
      WARLOCK => [THE_ARCHFEY, THE_FIEND, THE_GREAT_OLD_ONE],
      WIZARD => [
        SCHOOL_OF_ABJURATION, SCHOOL_OF_CONJURATION, SCHOOL_OF_DIVINATION, SCHOOL_OF_ENCHANTMENT,
        SCHOOL_OF_EVOCATION, SCHOOL_OF_ILLUSION, SCHOOL_OF_NECROMANCY, SCHOOL_OF_TRANSMUTATION
      ],
      ARTIFICER => [ALCHEMIST]
    }.freeze

    # учат заклинания при получении уровня, сразу подготовлены
    CLASSES_LEARN_SPELLS = [BARD, RANGER, SORCERER, WARLOCK, WIZARD].freeze

    # сразу известен весь классовый список заклинаний
    CLASSES_KNOW_SPELLS_LIST = [CLERIC, DRUID, PALADIN, ARTIFICER].freeze

    # подготавливают список к использованию после сна
    CLASSES_PREPARE_SPELLS = [CLERIC, DRUID, PALADIN, ARTIFICER, WIZARD].freeze

    attribute :data, Dnd5::CharacterData.to_type

    def decorate
      base_decorator.decorate_character_abilities(character: self)
        .then { |result| race_decorator.decorate_character_abilities(result: result) }
        .then { |result| subrace_decorator.decorate_character_abilities(result: result) }
        .then { |result| class_decorator.decorate_character_abilities(result: result) }
        .then { |result| subclass_decorator.decorate_character_abilities(result: result) }
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

    private

    def base_decorator = ::Charkeeper::Container.resolve('decorators.dnd5_character.base_decorator')
    def race_decorator = ::Charkeeper::Container.resolve('decorators.dnd5_character.race_wrapper')
    def subrace_decorator = ::Charkeeper::Container.resolve('decorators.dnd5_character.subrace_wrapper')
    def class_decorator = ::Charkeeper::Container.resolve('decorators.dnd5_character.class_wrapper')
    def subclass_decorator = ::Charkeeper::Container.resolve('decorators.dnd5_character.subclass_wrapper')
  end
end
