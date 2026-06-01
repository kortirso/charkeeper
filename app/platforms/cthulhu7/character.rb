# frozen_string_literal: true

module Cthulhu7
  class CharacterData
    include StoreModel::Model

    attribute :abilities, array: true, default: {
      'str' => 0, 'con' => 0, 'siz' => 0, 'dex' => 0, 'app' => 0, 'int' => 0, 'pow' => 0, 'edu' => 0
    }
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
