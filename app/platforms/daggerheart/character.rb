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

    def decorator
      base_decorator = ::DaggerheartCharacter::BaseDecorator.new(self)
      heritage_decorator = ::DaggerheartCharacter::HeritageDecorateWrapper.new(base_decorator)
      ::DaggerheartCharacter::ClassDecorateWrapper.new(heritage_decorator)
    end
  end
end
