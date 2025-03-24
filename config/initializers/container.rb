# frozen_string_literal: true

require 'dry/auto_inject'
require 'dry/container'

module Charkeeper
  class Container
    extend Dry::Container::Mixin

    DEFAULT_OPTIONS = { memoize: true }.freeze

    class << self
      def register(key)
        super(key, DEFAULT_OPTIONS)
      end
    end

    register('to_bool') { ToBool.new }
    register('monitoring.providers.bugsnag') { Monitoring::Providers::Bugsnag.new }
    register('monitoring.client') { Monitoring::Client.new }
    register('api.telegram.client') { TelegramApi::Client.new }

    # commands
    register('commands.auth_context.add_identity') { AuthContext::AddIdentityCommand.new }
    register('commands.users_context.update') { UsersContext::UpdateCommand.new }
    register('commands.characters_context.dnd5.create') { CharactersContext::Dnd5::CreateCommand.new }
    register('commands.characters_context.dnd5.update') { CharactersContext::Dnd5::UpdateCommand.new }
    register('commands.characters_context.dnd5.item_update') { CharactersContext::Dnd5::ItemUpdateCommand.new }
    register('commands.characters_context.dnd5.item_add') { CharactersContext::Dnd5::ItemAddCommand.new }
    register('commands.characters_context.dnd5.spell_update') { CharactersContext::Dnd5::SpellUpdateCommand.new }
    register('commands.characters_context.dnd5.spell_add') { CharactersContext::Dnd5::SpellAddCommand.new }
    register('commands.characters_context.dnd5.make_short_rest') { CharactersContext::Dnd5::MakeShortRestCommand.new }
    register('commands.characters_context.dnd5.make_long_rest') { CharactersContext::Dnd5::MakeLongRestCommand.new }
    register('commands.characters_context.add_note') { CharactersContext::NoteAddCommand.new }

    register('commands.characters_context.dnd2024.create') { CharactersContext::Dnd2024::CreateCommand.new }
    register('commands.characters_context.dnd2024.update') { CharactersContext::Dnd2024::UpdateCommand.new }
    register('commands.characters_context.dnd2024.spell_update') { CharactersContext::Dnd2024::SpellUpdateCommand.new }
    register('commands.characters_context.dnd2024.spell_add') { CharactersContext::Dnd2024::SpellAddCommand.new }
    register('commands.characters_context.dnd2024.make_short_rest') { CharactersContext::Dnd2024::MakeShortRestCommand.new }
    register('commands.characters_context.dnd2024.make_long_rest') { CharactersContext::Dnd2024::MakeLongRestCommand.new }

    register('commands.characters_context.pathfinder2.create') { CharactersContext::Pathfinder2::CreateCommand.new }
    register('commands.characters_context.pathfinder2.update') { CharactersContext::Pathfinder2::UpdateCommand.new }

    # decorators
    register('decorators.dummy_decorator') { DummyDecorator.new }

    register('decorators.pathfinder2_character.base_decorator') { Pathfinder2Character::BaseDecorator.new }
    register('decorators.pathfinder2_character.race_wrapper') { Pathfinder2Character::RaceDecorateWrapper.new }
    register('decorators.pathfinder2_character.subrace_wrapper') { Pathfinder2Character::SubraceDecorateWrapper.new }
    register('decorators.pathfinder2_character.class_wrapper') { Pathfinder2Character::ClassDecorateWrapper.new }

    register('decorators.pathfinder2_character.races.dwarf') { Pathfinder2Character::Races::DwarfDecorator.new }

    register('decorators.pathfinder2_character.classes.fighter') { Pathfinder2Character::Classes::FighterDecorator.new }

    register('decorators.dnd5_character.base_decorator') { Dnd5Character::BaseDecorator.new }
    register('decorators.dnd5_character.features') { Dnd5Character::FeaturesDecorator.new }
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
    register('decorators.dnd5_character.subraces.stout') { Dnd5Character::Subraces::StoudDecorator.new }
    register('decorators.dnd5_character.subraces.rock_gnome') { Dnd5Character::Subraces::RockGnomeDecorator.new }

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
    register('decorators.dnd5_character.classes.artificer') { Dnd5Character::Classes::ArtificerDecorator.new }

    register('decorators.dnd5_character.subclasses.circle_of_the_land') {
      Dnd5Character::Subclasses::CircleOfTheLandDecorator.new
    }
    register('decorators.dnd5_character.subclasses.alchemist') { Dnd5Character::Subclasses::AlchemistDecorator.new }

    register('decorators.dnd2024_character.base_decorator') { Dnd2024Character::BaseDecorator.new }
    register('decorators.dnd2024_character.species_wrapper') { Dnd2024Character::SpeciesDecorateWrapper.new }
    register('decorators.dnd2024_character.class_wrapper') { Dnd2024Character::ClassDecorateWrapper.new }
    register('decorators.dnd2024_character.features') { Dnd2024Character::FeaturesDecorator.new }

    register('decorators.dnd2024_character.species.dragonborn') { Dnd2024Character::Species::DragonbornDecorator.new }
    register('decorators.dnd2024_character.species.dwarf') { Dnd2024Character::Species::DwarfDecorator.new }
    register('decorators.dnd2024_character.species.elf') { Dnd2024Character::Species::ElfDecorator.new }
    register('decorators.dnd2024_character.species.gnome') { Dnd2024Character::Species::GnomeDecorator.new }
    register('decorators.dnd2024_character.species.orc') { Dnd2024Character::Species::OrcDecorator.new }
    register('decorators.dnd2024_character.species.halfling') { Dnd2024Character::Species::HalflingDecorator.new }
    register('decorators.dnd2024_character.species.human') { Dnd2024Character::Species::HumanDecorator.new }
    register('decorators.dnd2024_character.species.tiefling') { Dnd2024Character::Species::TieflingDecorator.new }
    register('decorators.dnd2024_character.species.aasimar') { Dnd2024Character::Species::AasimarDecorator.new }
    register('decorators.dnd2024_character.species.goliath') { Dnd2024Character::Species::GoliathDecorator.new }

    register('decorators.dnd2024_character.classes.barbarian') { Dnd2024Character::Classes::BarbarianDecorator.new }
    register('decorators.dnd2024_character.classes.bard') { Dnd2024Character::Classes::BardDecorator.new }
    register('decorators.dnd2024_character.classes.cleric') { Dnd2024Character::Classes::ClericDecorator.new }
    register('decorators.dnd2024_character.classes.druid') { Dnd2024Character::Classes::DruidDecorator.new }
    register('decorators.dnd2024_character.classes.fighter') { Dnd2024Character::Classes::FighterDecorator.new }
    register('decorators.dnd2024_character.classes.monk') { Dnd2024Character::Classes::MonkDecorator.new }
    register('decorators.dnd2024_character.classes.paladin') { Dnd2024Character::Classes::PaladinDecorator.new }
    register('decorators.dnd2024_character.classes.ranger') { Dnd2024Character::Classes::RangerDecorator.new }
    register('decorators.dnd2024_character.classes.rogue') { Dnd2024Character::Classes::RogueDecorator.new }
    register('decorators.dnd2024_character.classes.sorcerer') { Dnd2024Character::Classes::SorcererDecorator.new }
    register('decorators.dnd2024_character.classes.warlock') { Dnd2024Character::Classes::WarlockDecorator.new }
    register('decorators.dnd2024_character.classes.wizard') { Dnd2024Character::Classes::WizardDecorator.new }
    register('decorators.dnd2024_character.classes.artificer') { Dnd2024Character::Classes::ArtificerDecorator.new }

    # services
    register('services.auth_context.validate_web_telegram_signature') { AuthContext::WebTelegramSignatureValidateService.new }
    register('services.telegram_webhooks.handler') { TelegramWebhooks::HandleService.new }
  end
end

Deps = Dry::AutoInject(Charkeeper::Container)
