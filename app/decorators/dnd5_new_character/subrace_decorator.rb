# frozen_string_literal: true

module Dnd5NewCharacter
  class SubraceDecorator
    extend Dry::Initializer

    option :decorator

    def decorate
      result = decorator.decorate

      # дополнить result
      subrace_decorator(result[:subrace]).decorate(result: result)
    end

    private

    def subrace_decorator(subrace)
      case subrace
      when ::Dnd5::Character::MOUNTAIN_DWARF then ::Dnd5NewCharacter::Subraces::MountainDwarfDecorator.new
      when ::Dnd5::Character::HIGH_ELF then ::Dnd5NewCharacter::Subraces::HighElfDecorator.new
      when ::Dnd5::Character::WOOD_ELF then ::Dnd5NewCharacter::Subraces::WoodElfDecorator.new
      when ::Dnd5::Character::DROW then ::Dnd5NewCharacter::Subraces::DrowDecorator.new
      else ::DummyDecorator.new
      end
    end
  end
end
