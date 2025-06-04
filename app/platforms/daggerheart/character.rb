# frozen_string_literal: true

module Daggerheart
  class CharacterData
    include StoreModel::Model

    attribute :level, :integer, default: 1
    attribute :heritage, :string
    attribute :community, :string
    attribute :main_class, :string
    attribute :classes, array: true
    attribute :subclasses, array: true, default: {}
    attribute :subclasses_mastery, array: true, default: {}
    attribute :experiences, array: true, default: {}
    attribute :energy, array: true, default: {}
    attribute :traits, array: true, default: { str: 1, agi: 2, fin: 1, ins: 0, pre: 0, know: -1 }
    attribute :health, array: true, default: { marked: 0, max: 6 }
    attribute :stress, array: true, default: { marked: 0, max: 6 }
    attribute :hope, array: true, default: { marked: 2, max: 6 }
    attribute :evasion, :integer, default: 10
    attribute :spent_armor_slots, :integer, default: 0
    attribute :gold, array: true, default: { coins: 0, handfuls: 0, bags: 0, chests: 0 }
    attribute :selected_features, array: true, default: {}
  end

  class Character < Character
    def self.config
      @config ||= PlatformConfig.data('daggerheart')
    end

    def self.heritages
      config['heritages']
    end

    def self.heritage_info(race_value)
      config.dig('heritages', race_value)
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

    def self.communities
      config['communities']
    end

    attribute :data, Daggerheart::CharacterData.to_type

    def decorator
      base_decorator = ::DaggerheartCharacter::BaseDecorator.new(self)
      heritage_decorator = ::DaggerheartCharacter::HeritageDecorateWrapper.new(base_decorator)
      class_decorator = ::DaggerheartCharacter::ClassDecorateWrapper.new(heritage_decorator)
      ::DaggerheartCharacter::FeaturesDecorator.new(class_decorator)
    end
  end
end
