# frozen_string_literal: true

module Nimble
  class CharacterData
    include StoreModel::Model

    attribute :level, :integer, default: 1
    attribute :size, :string
    attribute :ancestry, :string
    attribute :main_class, :string
    attribute :subclass, :string
    attribute :abilities, array: true, default: { 'str' => 2, 'dex' => 2, 'int' => 0, 'wil' => -1 }
    attribute :health, array: true, default: { 'current' => 1, 'temp' => 0, 'max' => 1 }
    attribute :skill_levels, array: true, default: {} # { 'medicine' => 1 } владение навыками
    attribute :hit_die_spent, :integer, default: 0
    attribute :wounds_spent, :integer, default: 0
    attribute :languages, array: true, default: []
    attribute :weapons, array: true, default: []
    # доступные очки для распределения
    attribute :guide_step, :integer # этап помощи при создании персонажа
    attribute :skill_points, :integer, default: 4
  end

  class Character < Character
    def self.config
      PlatformConfig.data('nimble')
    end

    def self.sizes
      config['sizes']
    end

    def self.ancestries
      config['ancestries']
    end

    def self.ancestry_info(race_value)
      config.dig('ancestries', race_value)
    end

    def self.classes_info
      config['classes']
    end

    def self.class_info(class_value)
      config.dig('classes', class_value)
    end

    def self.abilities
      config['abilities']
    end

    attribute :data, Nimble::CharacterData.to_type

    def decorator(simple: false, version: nil, skip: [])
      NimbleDecorator.new.call(character: self, simple: simple, version: version, skip: skip)
    end
  end
end
