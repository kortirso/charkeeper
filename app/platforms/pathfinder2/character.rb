# frozen_string_literal: true

module Pathfinder2
  class CharacterData
    include StoreModel::Model

    attribute :level, :integer, default: 1
    attribute :race, :string
    attribute :subrace, :string
    attribute :main_class, :string
    attribute :classes, array: true
    attribute :abilities, array: true, default: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }
    attribute :health, array: true
    attribute :speed, :integer
    attribute :languages, array: true
  end

  class Character < Character
    # races
    DWARF = 'dwarf'

    # subraces
    ANCIENT_BLOODED_DWARF = 'ancient_blooded_dwarf'
    DEATH_WARDEN_DWARF = 'death_warden_dwarf'
    FORGE_DWARF = 'forge_dwarf'
    ROCK_DWARF = 'rock_dwarf'
    STRONG_BLOODED_DWARF = 'strong_blooded_dwarf'

    # classes
    FIGHTER = 'fighter'

    # languages
    # common, dwarven, gnomish, goblin, jotun, orcish, petran, sakvroth

    RACES = [DWARF].freeze
    SUBRACES = {
      DWARF => [ANCIENT_BLOODED_DWARF, DEATH_WARDEN_DWARF, FORGE_DWARF, ROCK_DWARF, STRONG_BLOODED_DWARF]
    }.freeze
    CLASSES = [
      FIGHTER
    ].freeze

    attribute :data, Pathfinder2::CharacterData.to_type

    def decorate
      base_decorator.decorate_character_abilities(character: self)
        .then { |result| race_decorator.decorate_character_abilities(result: result) }
        .then { |result| subrace_decorator.decorate_character_abilities(result: result) }
        .then { |result| class_decorator.decorate_character_abilities(result: result) }
    end

    private

    def base_decorator = ::Charkeeper::Container.resolve('decorators.pathfinder2_character.base_decorator')
    def race_decorator = ::Charkeeper::Container.resolve('decorators.pathfinder2_character.race_wrapper')
    def subrace_decorator = ::Charkeeper::Container.resolve('decorators.pathfinder2_character.subrace_wrapper')
    def class_decorator = ::Charkeeper::Container.resolve('decorators.pathfinder2_character.class_wrapper')
  end
end
