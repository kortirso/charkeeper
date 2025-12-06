# frozen_string_literal: true

module Dc20
  class CharacterData
    include StoreModel::Model

    attribute :level, :integer, default: 1
    attribute :main_class, :string
    attribute :ancestries, array: true
    attribute :classes, array: true
    attribute :abilities, array: true, default: { 'mig' => -2, 'agi' => -2, 'int' => -2, 'cha' => -2 }
    attribute :health, array: true, default: { 'current' => 1, 'temp' => 0 }
    attribute :stamina_points, array: true, default: { 'current' => 0, 'max' => 0 }
    attribute :mana_points, array: true, default: { 'current' => 0, 'max' => 0 }
    attribute :rest_points, array: true, default: { 'current' => 0, 'max' => 0 }
    attribute :grit_points, array: true, default: { 'current' => 0, 'max' => 0 }
    attribute :combat_expertise, array: true, default: [] # weapon, light_armor, heavy_armor, light_shield, heavy_shield
    attribute :skill_expertise, array: true, default: [] # компетентность в навыках
    attribute :skill_levels, array: true, default: {} # { 'medicine' => 1 } владение навыками
    attribute :trade_expertise, array: true, default: [] # компетентность в ремеслах
    attribute :trade_levels, array: true, default: {} # { 'arcana' => 1 } владение ремеслами
    attribute :trade_knowledge, array: true, default: {} # { 'Алхимия' => 'int' } известные нестандартные ремёсла
    attribute :language_levels, array: true, default: {} # { 'common' => 2 } владение языками
    attribute :conditions, array: true, default: []
    attribute :paths, array: true, default: { 'martial' => 0, 'spellcaster' => 0 }
    attribute :maneuvers, array: true, default: []
    attribute :path, array: true, default: []
    attribute :spell_list, array: true, default: [] # доступные списки заклинаний
    attribute :selected_talents, array: true, default: {}
    # доступные очки для распределения
    attribute :guide_step, :integer # этап помощи при создании персонажа
    attribute :ancestry_points, :integer, default: 0
    attribute :attribute_points, :integer, default: 12
    attribute :skill_points, :integer, default: 5
    attribute :skill_expertise_points, :integer, default: 0
    attribute :trade_points, :integer, default: 3
    attribute :trade_expertise_points, :integer, default: 0
    attribute :language_points, :integer, default: 2
    attribute :path_points, :integer, default: 0
    attribute :talent_points, :integer, default: 0
    attribute :class_feature_points, :integer, default: 0
  end

  class Character < Character
    def self.config
      PlatformConfig.data('dc20')
    end

    def self.ancestries
      config['ancestries']
    end

    def self.classes_info
      config['classes']
    end

    def self.combat_expertise
      config['combatExpertise']
    end

    attribute :data, Dc20::CharacterData.to_type

    def decorator(simple: false, version: nil)
      base_decorator = ::Dc20Character::BaseDecorator.new(self)
      base_features_decorator = ::FeaturesBaseDecorator.new(base_decorator)
      base_features_decorator.features unless simple
      class_decorator = ::Dc20Character::ClassDecorateWrapper.new(base_features_decorator)
      stats_decorator = ::Dc20Character::StatsDecorator.new(class_decorator)
      features_decorator = ::FeaturesDecorator.new(stats_decorator, version: version)
      features_decorator.features unless simple
      features_decorator
    end
  end
end
