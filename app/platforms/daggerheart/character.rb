# frozen_string_literal: true

module Daggerheart
  class CharacterData
    include StoreModel::Model

    attribute :level, :integer, default: 1
    attribute :heritage, :string
    attribute :heritage_name, :string
    attribute :heritage_features, array: true, default: []
    attribute :community, :string
    attribute :main_class, :string
    attribute :classes, array: true
    attribute :domains, array: true, default: {} # домены выбранные для вторичных классов
    attribute :subclasses, array: true, default: {}
    attribute :subclasses_mastery, array: true, default: {}
    attribute :traits, array: true, default: { 'str' => 1, 'agi' => 2, 'fin' => 1, 'ins' => 0, 'pre' => 0, 'know' => -1 }
    attribute :health_marked, :integer, default: 0
    attribute :health_max, :integer, default: 5
    attribute :stress_marked, :integer, default: 0
    attribute :stress_max, :integer, default: 6
    attribute :hope_marked, :integer, default: 2
    attribute :hope_max, :integer, default: 6
    attribute :evasion, :integer, default: 10
    attribute :spent_armor_slots, :integer, default: 0
    attribute :gold, array: true, default: { 'coins' => 0, 'handfuls' => 1, 'bags' => 0, 'chests' => 0 }
    attribute :leveling,
              array: true,
              default: { 'health' => 0, 'stress' => 0, 'evasion' => 0, 'proficiency' => 0, 'domain_cards' => 0 }
    attribute :experience, array: true, default: []
    attribute :beastform, :string
    attribute :selected_stances, array: true, default: []
    attribute :stance, :string
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

    def self.subclass_info(class_value, subclass_value)
      config.dig('classes', class_value, 'subclasses', subclass_value)
    end

    def self.domains_info(class_value)
      config.dig('classes', class_value, 'domains')
    end

    def self.communities
      config['communities']
    end

    def self.beastforms
      config['beastforms']
    end

    def self.stances
      config['stances']
    end

    def self.domains
      config['domains']
    end

    attribute :data, Daggerheart::CharacterData.to_type

    def tier
      return 4 if data.level >= 8
      return 3 if data.level >= 5
      return 2 if data.level >= 2

      1
    end

    def selected_domains
      (
        (
          self.class.domains_info(data.main_class) || ::Daggerheart::Homebrew::Speciality.find(data.main_class).data.domains
        ) + data.domains.values
      ).uniq
    end

    def decorator(simple: false)
      base_decorator = ::DaggerheartCharacter::BaseDecorator.new(self)
      features_decorator = ::FeaturesDecorator.new(base_decorator)
      features_decorator.features unless simple
      features_decorator
    end
  end
end
