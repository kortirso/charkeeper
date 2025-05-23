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
    attribute :selected_skills, array: true, default: {} # { acrobatics: 2, arcana: 1, crafting: 3 }
    attribute :lore_skills, array: true, default: { 'lore1' => { name: 'Lore', level: 0 }, 'lore2' => { name: 'Lore', level: 0 } }
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

    def decorator
      base_decorator = ::Pathfinder2Character::BaseDecorator.new(self)
      race_decorator = ::Pathfinder2Character::RaceDecorateWrapper.new(base_decorator)
      subrace_decorator = ::Pathfinder2Character::SubraceDecorateWrapper.new(race_decorator)
      ::Pathfinder2Character::ClassDecorateWrapper.new(subrace_decorator)
    end
  end
end
