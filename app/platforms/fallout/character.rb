# frozen_string_literal: true

module Fallout
  class CharacterData
    include StoreModel::Model

    attribute :level, :integer, default: 1
    attribute :origin, :string
    attribute :abilities, array: true, default: {
      'str' => 5, 'per' => 5, 'end' => 5, 'cha' => 5, 'int' => 5, 'agi' => 5, 'lck' => 5
    }
    attribute :max_abilities, array: true, default: {} # если нет значения - 10
    attribute :skills, array: true, default: {} # { barter: 1 }
    attribute :tag_skills, array: true, default: []
    attribute :perks, array: true, default: {}
    # только для 1 уровня
    attribute :guide_step, :integer # этап помощи при создании персонажа
    attribute :ability_boosts, :integer, default: 5 # повышение атрибутов
    attribute :tag_skill_boosts, :integer, default: 3 # мастерство навыков
    attribute :skill_boosts, :integer, default: 9 # ранги навыков
    attribute :perks_boosts, :integer, default: 1
  end

  class Character < Character
    def self.config
      @config ||= PlatformConfig.data('fallout')
    end

    def self.origins
      config['origins']
    end

    attribute :data, Fallout::CharacterData.to_type

    def decorator
      ::FalloutCharacter::BaseDecorator.new(self)
    end
  end
end
