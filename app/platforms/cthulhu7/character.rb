# frozen_string_literal: true

module Cthulhu7
  class CharacterData
    include StoreModel::Model

    attribute :abilities, array: true, default: {
      'str' => 0, 'con' => 0, 'siz' => 0, 'dex' => 0, 'app' => 0, 'int' => 0, 'pow' => 0, 'edu' => 0
    }
    attribute :selected_skills, array: true, default: {} # { 'accounting' => 20, 'archaeology' => 50, 'id' => 10 }
    attribute :additional_skills, array: true, default: {} # { 'id' => { 'name' => '', 'start' => 1 } }
    attribute :improved_skills, array: true, default: [] # ['accounting', 'archaeology', 'id']
    attribute :hidden_skills, array: true, default: [] # ['lasers']
    attribute :health, :integer, default: 1
    attribute :magic, :integer, default: 1
    attribute :sanity, :integer, default: 1
    attribute :luck_max, :integer, default: 1
    attribute :luck, :integer, default: 1
    # для левелинга
    attribute :guide_step, :integer # этап помощи при создании персонажа
  end

  class Character < Character
    def self.config
      @config ||= PlatformConfig.data('cthulhu7')
    end

    def self.abilities
      config['abilities']
    end

    attribute :data, Cthulhu7::CharacterData.to_type

    def decorator(simple: false, version: nil)
      Cthulhu7Decorator.new.call(character: self, simple: simple, version: version)
    end
  end
end
