# frozen_string_literal: true

module Dc20
  class CharacterData
    include StoreModel::Model

    attribute :level, :integer, default: 1
    attribute :main_class, :string
    attribute :classes, array: true
    attribute :abilities, array: true, default: { 'mig' => 3, 'agi' => 1, 'int' => 0, 'cha' => -2 }
    attribute :health, array: true, default: { 'current' => 1, 'temp' => 0 }
    attribute :combat_masteries, array: true, default: [] # weapon, light_armor, heavy_armor, shield
  end

  class Character < Character
    def self.config
      PlatformConfig.data('dc20')
    end

    def self.classes_info
      config['classes']
    end

    def self.combat_masteries
      config['combatMasteries']
    end

    attribute :data, Dc20::CharacterData.to_type

    def decorator
      base_decorator = ::Dc20Character::BaseDecorator.new(self)
      ::Dc20Character::ClassDecorateWrapper.new(base_decorator)
    end
  end
end
