# frozen_string_literal: true

module Dnd2024
  class CharacterData
    include StoreModel::Model

    attribute :level, :integer, default: 1
    attribute :species, :string
    attribute :legacy, :string
    attribute :background, :string
    attribute :size, :string, default: 'medium'
    attribute :alignment, :string
    attribute :main_class, :string
    attribute :classes, array: true
    attribute :subclasses, array: true
    attribute :abilities, array: true, default: { 'str' => 10, 'dex' => 10, 'con' => 10, 'int' => 10, 'wis' => 10, 'cha' => 10 }
    attribute :health, array: true
    attribute :death_saving_throws, array: true, default: { 'success' => 0, 'failure' => 0 }
    attribute :speed, :integer, default: 30
    attribute :speeds, array: true, default: {} # { 'flight' => 30, 'swim' => 0, 'climb' => 10 }
    attribute :darkvision, :integer, default: 0
    attribute :selected_skills, array: true, default: {} # { 'history' => 1 }
    attribute :selected_features, array: true, default: {} # { 'fighting_style' => ['fighting_style_defense'] }
    attribute :selected_feats, array: true, default: []
    attribute :languages, array: true
    attribute :weapon_core_skills, array: true
    attribute :weapon_skills, array: true
    attribute :weapon_mastery, array: true, default: [] # Оружейные приёмы
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
    attribute :selected_beastforms, array: true, default: []
    attribute :beastform, :string
    attribute :conditions, array: true, default: []
    attribute :heroic_inspiration, :boolean, default: false
    attribute :bardic_inspiration, :integer
    attribute :selected_talents, array: true, default: {}
    # только для 1 уровня
    attribute :guide_step, :integer # этап помощи при создании персонажа
    attribute :ability_boosts, array: true, default: [] # дополнительные повышения характеристик от происхождения
    attribute :any_skill_boosts, :integer, default: 0 # дополнительные повышения любого навыка
    attribute :skill_boosts, :integer, default: 0 # дополнительные повышения навыков от класса
    attribute :skill_boosts_list, array: true, default: [] # дополнительные повышения навыков от класса
    attribute :leveling_ability_boosts, :integer, default: 0
    attribute :leveling_ability_boosts_list, array: true, default: []
  end

  class Character < Character
    def self.config
      @config ||= PlatformConfig.data('dnd2024')
    end

    def self.species
      config['species']
    end

    def self.species_info(race_value)
      config.dig('species', race_value)
    end

    def self.sizes_info(race_value)
      config.dig('species', race_value, 'sizes')
    end

    def self.legacies_info(race_value)
      config.dig('species', race_value, 'legacies')
    end

    def self.legacy_info(race_value, legacy_value)
      config.dig('species', race_value, 'legacies', legacy_value)
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

    def self.beastforms
      config['beastforms']
    end

    def self.abilities
      config['abilities']
    end

    def self.skills
      config['skills']
    end

    def self.backgrounds
      config['backgrounds']
    end

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
      'barbarian' => 12, 'bard' => 8, 'cleric' => 8, 'druid' => 8, 'fighter' => 10, 'monk' => 8,
      'paladin' => 10, 'ranger' => 10, 'rogue' => 8, 'sorcerer' => 6, 'warlock' => 8, 'wizard' => 6, 'artificer' => 8
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
    CLASSES_KNOW_SPELLS_LIST = %w[bard cleric druid paladin ranger sorcerer warlock artificer].freeze

    attribute :data, Dnd2024::CharacterData.to_type

    def decorator(simple: false, version: nil)
      base_decorator = ::Dnd2024Character::BaseDecorator.new(self)
      base_features_decorator = ::FeaturesBaseDecorator.new(base_decorator)
      base_features_decorator.features unless simple
      species_decorator = ::Dnd2024Character::SpeciesDecorateWrapper.new(base_features_decorator)
      legacy_decorator = ::Dnd2024Character::LegacyDecorateWrapper.new(species_decorator)
      class_decorator = ::Dnd2024Character::ClassDecorateWrapper.new(legacy_decorator)
      subclass_decorator = ::Dnd2024Character::SubclassDecorateWrapper.new(class_decorator)
      features_decorator = ::FeaturesDecorator.new(subclass_decorator, version: version)
      features_decorator.features unless simple
      ::Dnd2024Character::OverallDecorator.new(features_decorator)
    end
  end
end
