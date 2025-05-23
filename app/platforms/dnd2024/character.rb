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
    attribute :death_saving_throws, array: true, default: { success: 0, failure: 0 }
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
    attribute :hit_dice, array: true, default: {} # максимальные кости хитов
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

    PATH_OF_THE_BERSERKER = 'path_of_the_berserker'
    PATH_OF_THE_WILD_HEART = 'path_of_the_wild_heart'
    PATH_OF_THE_WORLD_TREE = 'path_of_the_world_tree'
    PATH_OF_THE_ZEALOT = 'path_of_the_zealot'
    COLLEGE_OF_DANCE = 'college_of_dance'
    COLLEGE_OF_GLAMOUR = 'college_of_glamour'
    COLLEGE_OF_LORE = 'college_of_lore'
    COLLEGE_OF_VALOR = 'college_of_valor'
    LIFE_DOMAIN = 'life_domain'
    LIGHT_DOMAIN = 'light_domain'
    TRICKERY_DOMAIN = 'trickery_domain'
    WAR_DOMAIN = 'war_domain'
    CIRCLE_OF_THE_LAND = 'circle_of_the_land'
    CIRCLE_OF_THE_MOON = 'circle_of_the_moon'
    CIRCLE_OF_THE_SEA = 'circle_of_the_sea'
    CIRCLE_OF_THE_STARS = 'circle_of_the_stars'
    CHAMPION = 'champion'
    ELDRITCH_KNIGHT = 'eldritch_knight'
    PSI_WARRIOR = 'psi_warrior'
    BATTLE_MASTER = 'battle_master'
    WARRIOR_OF_MERCY = 'warrior_of_mercy'
    WARRIOR_OF_SHADOW = 'warrior_of_shadow'
    WARRIOR_OF_THE_ELEMENTS = 'warrior_of_the_elements'
    WARRIOR_OF_THE_OPEN_HAND = 'warrior_of_the_open_hand'
    OATH_OF_DEVOTION = 'oath_of_devotion'
    OATH_OF_GLORY = 'oath_of_glory'
    OATH_OF_THE_ANCIENTS = 'oath_of_the_ancients'
    OATH_OF_VENGEANCE = 'oath_of_vengeance'
    BEAST_MASTER = 'beast_master'
    FEY_WANDERER = 'fey_wanderer'
    GLOOM_STALKER = 'gloom_stalker'
    HUNTER = 'hunter'
    ARCANE_TRICKSTER = 'arcane_trickster'
    ASSASIN = 'assasin'
    SOULKNIFE = 'soulknife'
    THIEF = 'thief'
    ABERRANT_SORCERY = 'aberrant_sorcery'
    CLOCKWORK_SORCERY = 'clockwork_sorcery'
    DRACONIC_SORCERY = 'draconic_sorcery'
    WILD_MAGIC_SORCERY = 'wild_magic_sorcery'
    ARCHFEY_PATRON = 'archfey_patron'
    CELESTIAL_PATRON = 'celestial_patron'
    FIEND_PATRON = 'fiend_patron'
    GREAT_OLD_ONE_PATRON = 'great_old_one_patron'
    ABJURER = 'abjurer'
    DIVINER = 'diviner'
    EVOKER = 'evoker'
    ILLUSIONIST = 'illusionist'
    ALCHEMIST = 'alchemist'
    ARMORER = 'armorer'
    ARTILLERIST = 'artillerist'
    BATTLE_SMITH = 'battle_smith'

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
    SUBCLASSES = {
      BARBARIAN => [PATH_OF_THE_BERSERKER, PATH_OF_THE_WILD_HEART, PATH_OF_THE_WORLD_TREE, PATH_OF_THE_ZEALOT],
      BARD => [COLLEGE_OF_DANCE, COLLEGE_OF_GLAMOUR, COLLEGE_OF_LORE, COLLEGE_OF_VALOR],
      CLERIC => [LIFE_DOMAIN, LIGHT_DOMAIN, TRICKERY_DOMAIN, WAR_DOMAIN],
      DRUID => [CIRCLE_OF_THE_LAND, CIRCLE_OF_THE_MOON, CIRCLE_OF_THE_SEA, CIRCLE_OF_THE_STARS],
      FIGHTER => [CHAMPION, ELDRITCH_KNIGHT, PSI_WARRIOR, BATTLE_MASTER],
      MONK => [WARRIOR_OF_MERCY, WARRIOR_OF_SHADOW, WARRIOR_OF_THE_ELEMENTS, WARRIOR_OF_THE_OPEN_HAND],
      PALADIN => [OATH_OF_DEVOTION, OATH_OF_GLORY, OATH_OF_THE_ANCIENTS, OATH_OF_VENGEANCE],
      RANGER => [BEAST_MASTER, FEY_WANDERER, GLOOM_STALKER, HUNTER],
      ROGUE => [ARCANE_TRICKSTER, ASSASIN, SOULKNIFE, THIEF],
      SORCERER => [ABERRANT_SORCERY, CLOCKWORK_SORCERY, DRACONIC_SORCERY, WILD_MAGIC_SORCERY],
      WARLOCK => [ARCHFEY_PATRON, CELESTIAL_PATRON, FIEND_PATRON, GREAT_OLD_ONE_PATRON],
      WIZARD => [ABJURER, DIVINER, EVOKER, ILLUSIONIST],
      ARTIFICER => [ALCHEMIST, ARMORER, ARTILLERIST, BATTLE_SMITH]
    }.freeze
    HIT_DICES = {
      BARBARIAN => 12, BARD => 8, CLERIC => 8, DRUID => 8, FIGHTER => 10, MONK => 8,
      PALADIN => 10, RANGER => 10, ROGUE => 8, SORCERER => 6, WARLOCK => 8, WIZARD => 6, ARTIFICER => 8
    }.freeze

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

    def decorator(simple: false)
      base_decorator = ::Dnd2024Character::BaseDecorator.new(self)
      species_decorator = ::Dnd2024Character::SpeciesDecorateWrapper.new(base_decorator)
      class_decorator = ::Dnd2024Character::ClassDecorateWrapper.new(species_decorator)
      full_decorator = ::Dnd2024Character::FeaturesDecorator.new(class_decorator)
      full_decorator.features unless simple
      full_decorator
    end

    def can_learn_spell?(target_spell_class)
      target_spell_class == WIZARD
    end

    def can_prepare_spell?(target_spell_class)
      data.classes.key?(target_spell_class)
    end
  end
end
