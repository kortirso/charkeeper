# frozen_string_literal: true

module Dnd5NewCharacter
  class RaceDecorator
    extend Dry::Initializer

    option :decorator

    def decorate
      result = decorator.decorate

      # дополнить result
      race_decorator(result[:race]).decorate(result: result)
    end

    private

    def race_decorator(race)
      case race
      when ::Dnd5::Character::DWARF then ::Dnd5NewCharacter::Races::DwarfDecorator.new
      when ::Dnd5::Character::ELF then ::Dnd5NewCharacter::Races::ElfDecorator.new
      when ::Dnd5::Character::HALFLING then ::Dnd5NewCharacter::Races::HalflingDecorator.new
      when ::Dnd5::Character::HUMAN then ::Dnd5NewCharacter::Races::HumanDecorator.new
      when ::Dnd5::Character::DRAGONBORN then ::Dnd5NewCharacter::Races::DragonbornDecorator.new
      when ::Dnd5::Character::GNOME then ::Dnd5NewCharacter::Races::GnomeDecorator.new
      when ::Dnd5::Character::HALF_ELF then ::Dnd5NewCharacter::Races::HalfElfDecorator.new
      when ::Dnd5::Character::HALF_ORC then ::Dnd5NewCharacter::Races::HalfOrcDecorator.new
      when ::Dnd5::Character::TIEFLING then ::Dnd5NewCharacter::Races::TieflingDecorator.new
      end
    end
  end
end
