# frozen_string_literal: true

module Dnd5NewCharacter
  class ClassDecorator
    extend Dry::Initializer

    option :decorator

    def decorate
      result = decorator.decorate

      # дополнить result
      class_decorator(result[:main_class]).decorate(result: result)
    end

    private

    # rubocop: disable Metrics/CyclomaticComplexity
    def class_decorator(main_class)
      case main_class
      when ::Dnd5::Character::BARBARIAN then ::Dnd5NewCharacter::Classes::BarbarianDecorator.new
      when ::Dnd5::Character::BARD then ::Dnd5NewCharacter::Classes::BardDecorator.new
      when ::Dnd5::Character::CLERIC then ::Dnd5NewCharacter::Classes::ClericDecorator.new
      when ::Dnd5::Character::DRUID then ::Dnd5NewCharacter::Classes::DruidDecorator.new
      when ::Dnd5::Character::FIGHTER then ::Dnd5NewCharacter::Classes::FighterDecorator.new
      when ::Dnd5::Character::MONK then ::Dnd5NewCharacter::Classes::MonkDecorator.new
      when ::Dnd5::Character::PALADIN then ::Dnd5NewCharacter::Classes::PaladinDecorator.new
      when ::Dnd5::Character::RANGER then ::Dnd5NewCharacter::Classes::RangerDecorator.new
      when ::Dnd5::Character::ROGUE then ::Dnd5NewCharacter::Classes::RogueDecorator.new
      when ::Dnd5::Character::SORCERER then ::Dnd5NewCharacter::Classes::SorcererDecorator.new
      when ::Dnd5::Character::WARLOCK then ::Dnd5NewCharacter::Classes::WarlockDecorator.new
      when ::Dnd5::Character::WIZARD then ::Dnd5NewCharacter::Classes::WizardDecorator.new
      end
    end
    # rubocop: enable Metrics/CyclomaticComplexity
  end
end
