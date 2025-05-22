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
    register('api.imgproxy.client') { ImgproxyApi::Client.new }

    # builders
    register('builders.dummy') { DummyBuilder.new }

    register('builders.daggerheart_character.base') { DaggerheartCharacter::BaseBuilder.new }
    register('builders.daggerheart_character.heritage') { DaggerheartCharacter::HeritageBuilder.new }
    register('builders.daggerheart_character.class') { DaggerheartCharacter::ClassBuilder.new }
    register('builders.daggerheart_character.heritages.elf') { DaggerheartCharacter::Heritages::ElfBuilder.new }
    register('builders.daggerheart_character.classes.warrior') { DaggerheartCharacter::Classes::WarriorBuilder.new }

    register('builders.pathfinder2_character.base') { Pathfinder2Character::BaseBuilder.new }
    register('builders.pathfinder2_character.race') { Pathfinder2Character::RaceBuilder.new }
    register('builders.pathfinder2_character.subrace') { Pathfinder2Character::SubraceBuilder.new }
    register('builders.pathfinder2_character.class') { Pathfinder2Character::ClassBuilder.new }
    register('builders.pathfinder2_character.races.dwarf') { Pathfinder2Character::Races::DwarfBuilder.new }
    register('builders.pathfinder2_character.classes.fighter') { Pathfinder2Character::Classes::FighterBuilder.new }

    register('builders.dnd5_character.base') { Dnd5Character::BaseBuilder.new }
    register('builders.dnd5_character.race') { Dnd5Character::RaceBuilder.new }
    register('builders.dnd5_character.subrace') { Dnd5Character::SubraceBuilder.new }
    register('builders.dnd5_character.class') { Dnd5Character::ClassBuilder.new }

    register('builders.dnd5_character.races.dragonborn') { Dnd5Character::Races::DragonbornBuilder.new }
    register('builders.dnd5_character.races.dwarf') { Dnd5Character::Races::DwarfBuilder.new }
    register('builders.dnd5_character.races.elf') { Dnd5Character::Races::ElfBuilder.new }
    register('builders.dnd5_character.races.gnome') { Dnd5Character::Races::GnomeBuilder.new }
    register('builders.dnd5_character.races.half_elf') { Dnd5Character::Races::HalfElfBuilder.new }
    register('builders.dnd5_character.races.half_orc') { Dnd5Character::Races::HalfOrcBuilder.new }
    register('builders.dnd5_character.races.halfling') { Dnd5Character::Races::HalflingBuilder.new }
    register('builders.dnd5_character.races.human') { Dnd5Character::Races::HumanBuilder.new }
    register('builders.dnd5_character.races.tiefling') { Dnd5Character::Races::TieflingBuilder.new }

    register('builders.dnd5_character.subraces.drow') { Dnd5Character::Subraces::DrowBuilder.new }
    register('builders.dnd5_character.subraces.high_elf') { Dnd5Character::Subraces::HighElfBuilder.new }
    register('builders.dnd5_character.subraces.mountain_dwarf') { Dnd5Character::Subraces::MountainDwarfBuilder.new }
    register('builders.dnd5_character.subraces.wood_elf') { Dnd5Character::Subraces::WoodElfBuilder.new }
    register('builders.dnd5_character.subraces.stout') { Dnd5Character::Subraces::StoudBuilder.new }
    register('builders.dnd5_character.subraces.rock_gnome') { Dnd5Character::Subraces::RockGnomeBuilder.new }

    register('builders.dnd5_character.classes.barbarian') { Dnd5Character::Classes::BarbarianBuilder.new }
    register('builders.dnd5_character.classes.bard') { Dnd5Character::Classes::BardBuilder.new }
    register('builders.dnd5_character.classes.cleric') { Dnd5Character::Classes::ClericBuilder.new }
    register('builders.dnd5_character.classes.druid') { Dnd5Character::Classes::DruidBuilder.new }
    register('builders.dnd5_character.classes.fighter') { Dnd5Character::Classes::FighterBuilder.new }
    register('builders.dnd5_character.classes.monk') { Dnd5Character::Classes::MonkBuilder.new }
    register('builders.dnd5_character.classes.paladin') { Dnd5Character::Classes::PaladinBuilder.new }
    register('builders.dnd5_character.classes.ranger') { Dnd5Character::Classes::RangerBuilder.new }
    register('builders.dnd5_character.classes.rogue') { Dnd5Character::Classes::RogueBuilder.new }
    register('builders.dnd5_character.classes.sorcerer') { Dnd5Character::Classes::SorcererBuilder.new }
    register('builders.dnd5_character.classes.warlock') { Dnd5Character::Classes::WarlockBuilder.new }
    register('builders.dnd5_character.classes.wizard') { Dnd5Character::Classes::WizardBuilder.new }
    register('builders.dnd5_character.classes.artificer') { Dnd5Character::Classes::ArtificerBuilder.new }

    register('builders.dnd2024_character.base') { Dnd2024Character::BaseBuilder.new }
    register('builders.dnd2024_character.species') { Dnd2024Character::SpeciesBuilder.new }
    register('builders.dnd2024_character.class') { Dnd2024Character::ClassBuilder.new }

    register('builders.dnd2024_character.species.aasimar') { Dnd2024Character::Species::AasimarBuilder.new }
    register('builders.dnd2024_character.species.dragonborn') { Dnd2024Character::Species::DragonbornBuilder.new }
    register('builders.dnd2024_character.species.dwarf') { Dnd2024Character::Species::DwarfBuilder.new }
    register('builders.dnd2024_character.species.elf') { Dnd2024Character::Species::ElfBuilder.new }
    register('builders.dnd2024_character.species.gnome') { Dnd2024Character::Species::GnomeBuilder.new }
    register('builders.dnd2024_character.species.goliath') { Dnd2024Character::Species::GoliathBuilder.new }
    register('builders.dnd2024_character.species.halfling') { Dnd2024Character::Species::HalflingBuilder.new }
    register('builders.dnd2024_character.species.human') { Dnd2024Character::Species::HumanBuilder.new }
    register('builders.dnd2024_character.species.orc') { Dnd2024Character::Species::OrcBuilder.new }
    register('builders.dnd2024_character.species.tiefling') { Dnd2024Character::Species::TieflingBuilder.new }

    register('builders.dnd2024_character.classes.barbarian') { Dnd2024Character::Classes::BarbarianBuilder.new }
    register('builders.dnd2024_character.classes.bard') { Dnd2024Character::Classes::BardBuilder.new }
    register('builders.dnd2024_character.classes.cleric') { Dnd2024Character::Classes::ClericBuilder.new }
    register('builders.dnd2024_character.classes.druid') { Dnd2024Character::Classes::DruidBuilder.new }
    register('builders.dnd2024_character.classes.fighter') { Dnd2024Character::Classes::FighterBuilder.new }
    register('builders.dnd2024_character.classes.monk') { Dnd2024Character::Classes::MonkBuilder.new }
    register('builders.dnd2024_character.classes.paladin') { Dnd2024Character::Classes::PaladinBuilder.new }
    register('builders.dnd2024_character.classes.ranger') { Dnd2024Character::Classes::RangerBuilder.new }
    register('builders.dnd2024_character.classes.rogue') { Dnd2024Character::Classes::RogueBuilder.new }
    register('builders.dnd2024_character.classes.sorcerer') { Dnd2024Character::Classes::SorcererBuilder.new }
    register('builders.dnd2024_character.classes.warlock') { Dnd2024Character::Classes::WarlockBuilder.new }
    register('builders.dnd2024_character.classes.wizard') { Dnd2024Character::Classes::WizardBuilder.new }
    register('builders.dnd2024_character.classes.artificer') { Dnd2024Character::Classes::ArtificerBuilder.new }

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
    register('commands.characters_context.dnd5.change_health') { CharactersContext::Dnd5::ChangeHealthCommand.new }
    register('commands.characters_context.add_note') { CharactersContext::NoteAddCommand.new }

    register('commands.characters_context.dnd2024.create') { CharactersContext::Dnd2024::CreateCommand.new }
    register('commands.characters_context.dnd2024.update') { CharactersContext::Dnd2024::UpdateCommand.new }
    register('commands.characters_context.dnd2024.spell_update') { CharactersContext::Dnd2024::SpellUpdateCommand.new }
    register('commands.characters_context.dnd2024.spell_add') { CharactersContext::Dnd2024::SpellAddCommand.new }
    register('commands.characters_context.dnd2024.make_short_rest') { CharactersContext::Dnd2024::MakeShortRestCommand.new }
    register('commands.characters_context.dnd2024.make_long_rest') { CharactersContext::Dnd2024::MakeLongRestCommand.new }

    register('commands.characters_context.pathfinder2.create') { CharactersContext::Pathfinder2::CreateCommand.new }
    register('commands.characters_context.pathfinder2.update') { CharactersContext::Pathfinder2::UpdateCommand.new }

    register('commands.characters_context.daggerheart.create') { CharactersContext::Daggerheart::CreateCommand.new }
    register('commands.characters_context.daggerheart.update') { CharactersContext::Daggerheart::UpdateCommand.new }

    register('commands.image_processing.attach_avatar') { ImageProcessingContext::AttachAvatarCommand.new }

    # services
    register('services.auth_context.validate_web_telegram_signature') { AuthContext::WebTelegramSignatureValidateService.new }
    register('services.telegram_webhooks.handler') { TelegramWebhooks::HandleService.new }
  end
end

Deps = Dry::AutoInject(Charkeeper::Container)
