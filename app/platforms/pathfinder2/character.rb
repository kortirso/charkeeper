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
    attribute :abilities, array: true, default: { 'str' => 10, 'dex' => 10, 'con' => 10, 'int' => 10, 'wis' => 10, 'cha' => 10 }
    attribute :languages, array: true, default: []
    attribute :selected_skills, array: true, default: {} # { 'acrobatics' => 2, 'arcana' => 1, 'crafting' => 3 }
    attribute :lores, array: true, default: {}
    attribute :lore_skills, array: true, default: { 'lore1' => { name: '', level: 0 }, 'lore2' => { name: '', level: 0 } }
    attribute :weapon_skills, array: true, default: { 'unarmed' => 0, 'simple' => 0, 'martial' => 0, 'advanced' => 0 }
    attribute :armor_skills, array: true, default: { 'unarmored' => 0, 'light' => 0, 'medium' => 0, 'heavy' => 0 }
    attribute :saving_throws, array: true, default: { 'fortitude' => 0, 'reflex' => 0, 'will' => 0 }
    attribute :perception, :integer, default: 0
    attribute :class_dc, :integer, default: 0
    attribute :spell_dc, :integer, default: 0
    attribute :spell_attack, :integer, default: 0
    attribute :dying_condition_value, :integer, default: 0
    attribute :coins, array: true, default: { 'gold' => 0, 'silver' => 0, 'copper' => 0 }
    attribute :money, :integer, default: 0
    attribute :vision, :string, default: nil # low-light dark
    attribute :conditions, array: true, default: []
    attribute :selected_feats, array: true, default: {} # { 'id' => [{ type: '', level: '' }] }
    attribute :selected_features, array: true, default: {} # { 'fighting_style' => ['fighting_style_defense'] }
    attribute :spent_spell_slots, array: true, default: {}
    attribute :experience, :integer, default: 0
    attribute :health_current, :integer, default: 6
    attribute :health_temp, :integer, default: 0
    attribute :hero_points, :integer, default: 0
    attribute :damage_reduction, array: true, default: { 'immune' => {}, 'weakness' => {}, 'resistance' => {} }
    # только для 1 уровня
    attribute :ability_boosts, array: true # дополнительные повышения характеристик
    attribute :ability_boosts_v2, array: true, default: {} # дополнительные повышения характеристик
    attribute :skill_boosts, array: true, default: {} # дополнительные повышения навыков
    # DEPRECATED
    attribute :health, array: true
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

    # не подготавливают заклинания
    SPONTANEOUS_CASTERS = %w[bard].freeze

    attribute :data, Pathfinder2::CharacterData.to_type

    has_one :pet, class_name: 'Pathfinder2::Character::Pet', dependent: :destroy
    has_one :animal_companion, class_name: 'Pathfinder2::Character::AnimalCompanion', dependent: :destroy

    def decorator(simple: false, version: nil)
      Pathfinder2Decorator.new.call(character: self, simple: simple, version: version)
    end
  end
end
