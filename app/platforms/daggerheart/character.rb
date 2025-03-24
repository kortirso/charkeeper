# frozen_string_literal: true

module Daggerheart
  class CharacterData
    include StoreModel::Model

    attribute :level, :integer, default: 1
    attribute :heritage, :string
    attribute :main_class, :string
    attribute :classes, array: true
    attribute :traits, array: true, default: { str: 1, agi: 2, fin: 1, ins: 0, pre: 0, know: -1 }
  end

  class Character < Character
    # heritages
    ELF = 'elf'

    # classes
    WARRIOR = 'warrior'

    HERITAGES = [ELF].freeze
    CLASSES = [
      WARRIOR
    ].freeze

    attribute :data, Daggerheart::CharacterData.to_type

    def decorate
      base_decorator.decorate_character_abilities(character: self)
        .then { |result| heritage_decorator.decorate_character_abilities(result: result) }
        .then { |result| class_decorator.decorate_character_abilities(result: result) }
    end

    private

    def base_decorator = ::Charkeeper::Container.resolve('decorators.daggerheart_character.base_decorator')
    def heritage_decorator = ::Charkeeper::Container.resolve('decorators.daggerheart_character.heritage_wrapper')
    def class_decorator = ::Charkeeper::Container.resolve('decorators.daggerheart_character.class_wrapper')
  end
end
