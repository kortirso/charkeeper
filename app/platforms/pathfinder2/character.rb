# frozen_string_literal: true

module Pathfinder2
  class CharacterData
    include StoreModel::Model

    attribute :level, :integer, default: 1
    attribute :speed, :integer, default: 25
    attribute :main_ability, :string
    attribute :spell_list, :string # occult, primal, arcane, divine
    attribute :race, :string
    attribute :subrace, :string
    attribute :background, :string
    attribute :main_class, :string
    attribute :classes, array: true
    attribute :subclasses, array: true
    attribute :abilities, array: true, default: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }
    attribute :health, array: true
    attribute :languages, :string
    attribute :selected_skills, array: true, default: {} # { acrobatics: 2, arcana: 1, crafting: 3 }
    attribute :lore_skills, array: true, default: { 'lore1' => { name: '', level: 0 }, 'lore2' => { name: '', level: 0 } }
    attribute :weapon_skills, array: true, default: { unarmed: 0, simple: 0, martial: 0, advanced: 0 }
    attribute :armor_skills, array: true, default: { unarmored: 0, light: 0, medium: 0, heavy: 0 }
    attribute :saving_throws, array: true, default: { fortitude: 0, reflex: 0, will: 0 }
    attribute :perception, :integer, default: 0
    attribute :class_dc, :integer, default: 0
    attribute :dying_condition_value, :integer, default: 0
    attribute :coins, array: true, default: { gold: 0, silver: 0, copper: 0 }
    attribute :vision, :string, default: nil # low-light dark
    attribute :conditions, array: true, default: []
    # только для 1 уровня
    attribute :ability_boosts, array: true # дополнительные повышения характеристик
    attribute :skill_boosts, array: true # дополнительные повышения навыков
  end

  class Character < Character
    def self.config
      @config ||= PlatformConfig.data('pathfinder2')
    end

    def self.races
      config['races']
    end

    def self.race_info(race_value)
      config.dig('races', race_value)
    end

    def self.subraces(race_value)
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

    def self.main_ability_options(class_value)
      config.dig('classes', class_value, 'main_ability_options')
    end

    def self.backgrounds
      config['backgrounds']
    end

    def self.abilities
      config['abilities']
    end

    def self.skills
      config['skills']
    end

    def self.saving_throws
      config['savingThrows']
    end

    attribute :data, Pathfinder2::CharacterData.to_type

    def decorator
      base_decorator = ::Pathfinder2Character::BaseDecorator.new(self)
      race_decorator = ::Pathfinder2Character::RaceDecorateWrapper.new(base_decorator)
      subrace_decorator = ::Pathfinder2Character::SubraceDecorateWrapper.new(race_decorator)
      ::Pathfinder2Character::ClassDecorateWrapper.new(subrace_decorator)
    end
  end
end
