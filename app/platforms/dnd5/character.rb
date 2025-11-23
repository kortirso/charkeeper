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
    attribute :abilities, array: true, default: { 'str' => 10, 'dex' => 10, 'con' => 10, 'int' => 10, 'wis' => 10, 'cha' => 10 }
    attribute :health, array: true
    attribute :death_saving_throws, array: true, default: { 'success' => 0, 'failure' => 0 }
    attribute :speed, :integer
    attribute :selected_skills, array: true, default: [] # ['history']
    attribute :selected_feats, array: true, default: {} # { 'fighting_style' => ['fighting_style_defense'] }
    attribute :languages, array: true
    attribute :weapon_core_skills, array: true
    attribute :weapon_skills, array: true
    attribute :armor_proficiency, array: true
    attribute :coins, array: true, default: { 'gold' => 0, 'silver' => 0, 'copper' => 0 }
    attribute :money, :integer, default: 0
    attribute :spent_spell_slots, array: true, default: {}
    attribute :hit_dice, array: true, default: {} # максимальные кости хитов
    attribute :spent_hit_dice, array: true, default: {} # потраченные кости хитов
    attribute :tools, array: true, default: [] # владение инструментами
    attribute :music, array: true, default: [] # владение музыкальными инструментами
    attribute :resistance, array: true, default: [] # сопротивления
    attribute :immunity, array: true, default: [] # иммунитеты
    attribute :vulnerability, array: true, default: [] # уязвимости
    attribute :conditions, array: true, default: []
  end

  class Character < Character
    def self.config
      @config ||= PlatformConfig.data('dnd5')
    end

    def self.races
      config['races']
    end

    def self.race_info(race_value)
      config.dig('races', race_value)
    end

    def self.subraces_info(race_value)
      config.dig('races', race_value, 'subraces')
    end

    def self.subrace_info(race_value, subrace_value)
      config.dig('races', race_value, 'subraces', subrace_value)
    end

    def self.classes_info
      config['classes']
    end

    def self.class_info(class_value)
      config.dig('classes', class_value)
    end

    def self.subclasses_info(class_value)
      config.dig('classes', class_value, 'subclasses')
    end

    def self.subclass_info(class_value, subclass_value)
      config.dig('classes', class_value, 'subclasses', subclass_value)
    end

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
    ALIGNMENTS = [
      LAWFUL_GOOD, LAWFUL_NEUTRAL, LAWFUL_EVIL, NEUTRAL_GOOD, NEUTRAL,
      NEUTRAL_EVIL, CHAOTIC_GOOD, CHAOTIC_NEUTRAL, CHAOTIC_EVIL
    ].freeze
    HIT_DICES = {
      BARBARIAN => 12, BARD => 8, CLERIC => 8, DRUID => 8, FIGHTER => 10, MONK => 8,
      PALADIN => 10, RANGER => 10, ROGUE => 8, SORCERER => 6, WARLOCK => 8, WIZARD => 6, ARTIFICER => 8
    }.freeze

    # учат заклинания при получении уровня, сразу подготовлены
    CLASSES_LEARN_SPELLS = [BARD, RANGER, SORCERER, WARLOCK, WIZARD].freeze

    # сразу известен весь классовый список заклинаний
    CLASSES_KNOW_SPELLS_LIST = [CLERIC, DRUID, PALADIN, ARTIFICER].freeze

    # подготавливают список к использованию после сна
    CLASSES_PREPARE_SPELLS = [CLERIC, DRUID, PALADIN, ARTIFICER, WIZARD].freeze

    attribute :data, Dnd5::CharacterData.to_type

    def decorator(simple: false, version: nil)
      base_decorator = ::Dnd5Character::BaseDecorator.new(self)
      base_features_decorator = ::FeaturesBaseDecorator.new(base_decorator)
      base_features_decorator.features unless simple
      race_decorator = ::Dnd5Character::RaceDecorateWrapper.new(base_features_decorator)
      subrace_decorator = ::Dnd5Character::SubraceDecorateWrapper.new(race_decorator)
      class_decorator = ::Dnd5Character::ClassDecorateWrapper.new(subrace_decorator)
      subclass_decorator = ::Dnd5Character::SubclassDecorateWrapper.new(class_decorator)
      features_decorator = ::FeaturesDecorator.new(subclass_decorator, version: version)
      features_decorator.features unless simple
      ::Dnd5Character::OverallDecorator.new(features_decorator)
    end
  end
end
