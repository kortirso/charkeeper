# frozen_string_literal: true

module Daggerheart
  class CharacterData
    include StoreModel::Model

    LEVELING = {
      'traits' => { '2' => 0, '3' => 0, '4' => 0 },
      'selected_traits' => { '2' => [], '3' => [], '4' => [] },
      'health' => 0,
      'stress' => 0,
      'experience' => 0,
      'domain_cards' => 0,
      'evasion' => 0,
      'proficiency' => 0,
      'subclass' => 0,
      'multiclass' => 0
    }.freeze

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
    attribute :money, :integer, default: 0
    attribute :leveling, array: true, default: LEVELING
    attribute :experience, array: true, default: []
    attribute :beastform, :string
    attribute :beast, :string
    attribute :hybrid, array: true, default: {} # { 'terrible_lizard' => { 'adv': [], 'features': [] } }
    attribute :transformation, :string
    attribute :selected_stances, array: true, default: []
    attribute :stance, :string
    attribute :selected_features, array: true, default: {} # { 'fighting_style' => ['fighting_style_defense'] }
    attribute :guide_step, :integer # этап помощи при создании персонажа
    attribute :conditions, array: true, default: []
    attribute :scars, array: true, default: []
  end

  class Character < Character
    def self.config
      PlatformConfig.data('daggerheart')
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

    def self.community_info(value)
      config.dig('communities', value)
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

    def self.traits
      config['traits']
    end

    def self.ranges
      config['ranges']
    end

    attribute :data, Daggerheart::CharacterData.to_type

    has_many :projects, class_name: 'Daggerheart::Project', dependent: :destroy

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

    def ancestry_name
      return data.heritage_name if data.heritage.nil?

      default = ::Daggerheart::Character.heritage_info(data.heritage)
      return translate(default['name']) if default

      translate(daggerheart_names.fetch_item(key: :ancestries, id: data.heritage)[:name])
    end

    def community_name
      default = ::Daggerheart::Character.community_info(data.community)
      return translate(default['name']) if default

      translate(daggerheart_names.fetch_item(key: :communities, id: data.community)[:name])
    end

    def subclass_names
      data.subclasses.each_with_object({}) do |(class_slug, subclass_slug), acc|
        acc[class_name(class_slug)] = subclass_name(class_slug, subclass_slug)
      end
    end

    def decorator(simple: false, version: nil)
      base_decorator = ::DaggerheartCharacter::BaseDecorator.new(self)
      base_features_decorator = ::FeaturesBaseDecorator.new(base_decorator)
      base_features_decorator.features unless simple
      stats_decorator = ::DaggerheartCharacter::StatsDecorator.new(base_features_decorator)
      features_decorator = ::FeaturesDecorator.new(stats_decorator, version: version)
      features_decorator.features unless simple
      ::DaggerheartCharacter::OverallDecorator.new(features_decorator)
    end

    private

    def class_name(class_slug)
      default = ::Daggerheart::Character.class_info(class_slug)
      return translate(default['name']) if default

      translate(daggerheart_names.fetch_item(key: :classes, id: class_slug)[:name])
    end

    def subclass_name(class_slug, subclass_slug)
      default = ::Daggerheart::Character.subclass_info(class_slug, subclass_slug)
      return translate(default['name']) if default

      translate(daggerheart_names.fetch_item(key: :subclasses, id: subclass_slug)[:name])
    end

    def daggerheart_names = Charkeeper::Container.resolve('cache.daggerheart_names')
  end
end
