# frozen_string_literal: true

require 'dry/auto_inject'
require 'dry/container'

module Characters
  class Container
    extend Dry::Container::Mixin

    DEFAULT_OPTIONS = { memoize: true }.freeze

    class << self
      def register(key)
        super(key, DEFAULT_OPTIONS)
      end
    end

    register('to_bool') { ToBool.new }

    # commands
    register('commands.auth_context.add_identity') { AuthContext::AddIdentityCommand.new }
    register('commands.characters_context.dnd5.create') { CharactersContext::Dnd5::CreateCommand.new }
    register('commands.characters_context.dnd5.update') { CharactersContext::Dnd5::UpdateCommand.new }
    register('commands.characters_context.dnd5.item_update') { CharactersContext::Dnd5::ItemUpdateCommand.new }
    register('commands.characters_context.dnd5.item_add') { CharactersContext::Dnd5::ItemAddCommand.new }
    register('commands.characters_context.dnd5.spell_update') { CharactersContext::Dnd5::SpellUpdateCommand.new }
    register('commands.characters_context.dnd5.spell_add') { CharactersContext::Dnd5::SpellAddCommand.new }

    # decorators
    register('decorators.dnd5_character.dummy_decorator') { DummyDecorator.new }
    register('decorators.dnd5_character.base_decorator') { Dnd5Character::BaseDecorator.new }
    register('decorators.dnd5_character.race_wrapper') { Dnd5Character::RaceDecorateWrapper.new }
    register('decorators.dnd5_character.subrace_wrapper') { Dnd5Character::SubraceDecorateWrapper.new }
    register('decorators.dnd5_character.class_wrapper') { Dnd5Character::ClassDecorateWrapper.new }
    register('decorators.dnd5_character.subclass_wrapper') { Dnd5Character::SubclassDecorateWrapper.new }

    register('decorators.dnd5_character.races.dragonborn') { Dnd5Character::Races::DragonbornDecorator.new }
    register('decorators.dnd5_character.races.dwarf') { Dnd5Character::Races::DwarfDecorator.new }
    register('decorators.dnd5_character.races.elf') { Dnd5Character::Races::ElfDecorator.new }
    register('decorators.dnd5_character.races.gnome') { Dnd5Character::Races::GnomeDecorator.new }
    register('decorators.dnd5_character.races.half_elf') { Dnd5Character::Races::HalfElfDecorator.new }
    register('decorators.dnd5_character.races.half_orc') { Dnd5Character::Races::HalfOrcDecorator.new }
    register('decorators.dnd5_character.races.halfling') { Dnd5Character::Races::HalflingDecorator.new }
    register('decorators.dnd5_character.races.human') { Dnd5Character::Races::HumanDecorator.new }
    register('decorators.dnd5_character.races.tiefling') { Dnd5Character::Races::TieflingDecorator.new }

    register('decorators.dnd5_character.subraces.drow') { Dnd5Character::Subraces::DrowDecorator.new }
    register('decorators.dnd5_character.subraces.high_elf') { Dnd5Character::Subraces::HighElfDecorator.new }
    register('decorators.dnd5_character.subraces.mountain_dwarf') { Dnd5Character::Subraces::MountainDwarfDecorator.new }
    register('decorators.dnd5_character.subraces.wood_elf') { Dnd5Character::Subraces::WoodElfDecorator.new }

    register('decorators.dnd5_character.classes.barbarian') { Dnd5Character::Classes::BarbarianDecorator.new }
    register('decorators.dnd5_character.classes.bard') { Dnd5Character::Classes::BardDecorator.new }
    register('decorators.dnd5_character.classes.cleric') { Dnd5Character::Classes::ClericDecorator.new }
    register('decorators.dnd5_character.classes.druid') { Dnd5Character::Classes::DruidDecorator.new }
    register('decorators.dnd5_character.classes.fighter') { Dnd5Character::Classes::FighterDecorator.new }
    register('decorators.dnd5_character.classes.monk') { Dnd5Character::Classes::MonkDecorator.new }
    register('decorators.dnd5_character.classes.paladin') { Dnd5Character::Classes::PaladinDecorator.new }
    register('decorators.dnd5_character.classes.ranger') { Dnd5Character::Classes::RangerDecorator.new }
    register('decorators.dnd5_character.classes.rogue') { Dnd5Character::Classes::RogueDecorator.new }
    register('decorators.dnd5_character.classes.sorcerer') { Dnd5Character::Classes::SorcererDecorator.new }
    register('decorators.dnd5_character.classes.warlock') { Dnd5Character::Classes::WarlockDecorator.new }
    register('decorators.dnd5_character.classes.wizard') { Dnd5Character::Classes::WizardDecorator.new }

    register('decorators.dnd5_character.subclasses.circle_of_the_land') {
      Dnd5Character::Subclasses::CircleOfTheLandDecorator.new
    }
    register('decorators.dnd5_character.subclasses.draconic_bloodline') {
      Dnd5Character::Subclasses::DraconicBloodlineDecorator.new
    }
    register('decorators.dnd5_character.subclasses.champion') { Dnd5Character::Subclasses::ChampionDecorator.new }

    # services
    register('services.auth_context.validate_web_telegram_signature') { AuthContext::WebTelegramSignatureValidateService.new }
  end
end

Deps = Dry::AutoInject(Characters::Container)
