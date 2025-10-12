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
    register('roll') { Roll.new }
    register('monitoring.providers.rails') { Monitoring::Providers::Rails.new }
    register('monitoring.client') { Monitoring::Client.new }
    register('api.telegram.client') { TelegramApi::Client.new }
    register('api.imgproxy.client') { ImgproxyApi::Client.new }

    # commands
    register('commands.auth_context.add_identity') { AuthContext::AddIdentityCommand.new }
    register('commands.auth_context.add_user') { AuthContext::AddUserCommand.new }
    register('commands.users_context.update') { UsersContext::UpdateCommand.new }
    register('commands.users_context.add_feedback') { UsersContext::AddFeedbackCommand.new }

    register('commands.characters_context.item_update') { CharactersContext::ItemUpdateCommand.new }
    register('commands.characters_context.item_add') { CharactersContext::ItemAddCommand.new }
    register('commands.characters_context.change_feat') { CharactersContext::ChangeFeatCommand.new }

    register('commands.characters_context.dc20.create') { CharactersContext::Dc20::CreateCommand.new }
    register('commands.characters_context.dc20.update') { CharactersContext::Dc20::UpdateCommand.new }

    register('commands.characters_context.dnd5.create') { CharactersContext::Dnd5::CreateCommand.new }
    register('commands.characters_context.dnd5.update') { CharactersContext::Dnd5::UpdateCommand.new }
    register('commands.characters_context.dnd5.spell_update') { CharactersContext::Dnd5::SpellUpdateCommand.new }
    register('commands.characters_context.dnd5.spell_add') { CharactersContext::Dnd5::SpellAddCommand.new }
    register('commands.characters_context.dnd5.make_short_rest') { CharactersContext::Dnd5::MakeShortRestCommand.new }
    register('commands.characters_context.dnd5.make_long_rest') { CharactersContext::Dnd5::MakeLongRestCommand.new }
    register('commands.characters_context.dnd5.change_health') { CharactersContext::Dnd5::ChangeHealthCommand.new }
    register('commands.characters_context.dnd5.add_bonus') { CharactersContext::Dnd5::AddBonusCommand.new }
    register('commands.characters_context.add_note') { CharactersContext::NoteAddCommand.new }
    register('commands.characters_context.change_note') { CharactersContext::ChangeNoteCommand.new }

    register('commands.characters_context.dnd2024.create') { CharactersContext::Dnd2024::CreateCommand.new }
    register('commands.characters_context.dnd2024.update') { CharactersContext::Dnd2024::UpdateCommand.new }
    register('commands.characters_context.dnd2024.spell_update') { CharactersContext::Dnd2024::SpellUpdateCommand.new }
    register('commands.characters_context.dnd2024.spell_add') { CharactersContext::Dnd2024::SpellAddCommand.new }
    register('commands.characters_context.dnd2024.make_short_rest') { CharactersContext::Dnd2024::MakeShortRestCommand.new }
    register('commands.characters_context.dnd2024.make_long_rest') { CharactersContext::Dnd2024::MakeLongRestCommand.new }

    register('commands.characters_context.pathfinder2.create') { CharactersContext::Pathfinder2::CreateCommand.new }
    register('commands.characters_context.pathfinder2.update') { CharactersContext::Pathfinder2::UpdateCommand.new }
    register('commands.characters_context.pathfinder2.change_health') { CharactersContext::Pathfinder2::ChangeHealthCommand.new }

    register('commands.characters_context.daggerheart.create') { CharactersContext::Daggerheart::CreateCommand.new }
    register('commands.characters_context.daggerheart.update') { CharactersContext::Daggerheart::UpdateCommand.new }
    register('commands.characters_context.daggerheart.add_bonus') { CharactersContext::Daggerheart::AddBonusCommand.new }
    register('commands.characters_context.daggerheart.add_spell') { CharactersContext::Daggerheart::AddSpellCommand.new }
    register('commands.characters_context.daggerheart.change_spell') { CharactersContext::Daggerheart::ChangeSpellCommand.new }
    register('commands.characters_context.daggerheart.change_energy') { CharactersContext::Daggerheart::ChangeEnergyCommand.new }
    register('commands.characters_context.daggerheart.add_companion') { CharactersContext::Daggerheart::AddCompanionCommand.new }
    register('commands.characters_context.daggerheart.change_companion') {
      CharactersContext::Daggerheart::ChangeCompanionCommand.new
    }

    register('commands.image_processing.attach_avatar_by_file') { ImageProcessingContext::AttachAvatarByFileCommand.new }
    register('commands.image_processing.attach_avatar_by_url') { ImageProcessingContext::AttachAvatarByUrlCommand.new }

    register('commands.webhooks_context.telegram.receive_message_webhook') {
      WebhooksContext::Telegram::ReceiveMessageWebhookCommand.new
    }
    register('commands.webhooks_context.telegram.receive_chat_member_webhook') {
      WebhooksContext::Telegram::ReceiveChatMemberWebhookCommand.new
    }

    register('commands.homebrew_context.add_book') { HomebrewContext::AddBookCommand.new }
    register('commands.homebrew_context.remove_book') { HomebrewContext::RemoveBookCommand.new }

    register('commands.homebrew_context.add_race') { HomebrewContext::AddRaceCommand.new }

    register('commands.homebrew_context.daggerheart.add_community') { HomebrewContext::Daggerheart::AddCommunityCommand.new }
    register('commands.homebrew_context.daggerheart.add_race') { HomebrewContext::Daggerheart::AddRaceCommand.new }
    register('commands.homebrew_context.daggerheart.add_feat') { HomebrewContext::Daggerheart::AddFeatCommand.new }
    register('commands.homebrew_context.daggerheart.add_item') { HomebrewContext::Daggerheart::AddItemCommand.new }
    register('commands.homebrew_context.daggerheart.add_speciality') { HomebrewContext::Daggerheart::AddSpecialityCommand.new }
    register('commands.homebrew_context.daggerheart.add_subclass') { HomebrewContext::Daggerheart::AddSubclassCommand.new }
    register('commands.homebrew_context.daggerheart.copy_feats') { HomebrewContext::Daggerheart::CopyFeatsCommand.new }
    register('commands.homebrew_context.daggerheart.copy_race') { HomebrewContext::Daggerheart::CopyRaceCommand.new }
    register('commands.homebrew_context.daggerheart.copy_community') { HomebrewContext::Daggerheart::CopyCommunityCommand.new }
    register('commands.homebrew_context.daggerheart.copy_subclass') { HomebrewContext::Daggerheart::CopySubclassCommand.new }
    register('commands.homebrew_context.daggerheart.copy_item') { HomebrewContext::Daggerheart::CopyItemCommand.new }
    register('commands.homebrew_context.daggerheart.add_book_races') { HomebrewContext::Daggerheart::AddBookRacesCommand.new }
    register('commands.homebrew_context.daggerheart.add_book_communities') {
      HomebrewContext::Daggerheart::AddBookCommunitiesCommand.new
    }
    register('commands.homebrew_context.daggerheart.add_book_subclasses') {
      HomebrewContext::Daggerheart::AddBookSubclassesCommand.new
    }
    register('commands.homebrew_context.daggerheart.add_book_items') { HomebrewContext::Daggerheart::AddBookItemsCommand.new }
    register('commands.homebrew_context.copy_book') { HomebrewContext::CopyBookCommand.new }
    register('commands.homebrew_context.daggerheart.copy_book') { HomebrewContext::Daggerheart::CopyBookCommand.new }

    register('commands.campaigns_context.add_campaign') { CampaignsContext::AddCampaignCommand.new }
    register('commands.campaigns_context.join_campaign') { CampaignsContext::JoinCampaignCommand.new }
    register('commands.campaigns_context.remove_campaign') { CampaignsContext::RemoveCampaignCommand.new }

    register('commands.channels_context.add_channel') { ChannelsContext::AddChannelCommand.new }

    register('commands.homebrew_context.daggerheart.add_transformation') {
      HomebrewContext::Daggerheart::AddTransformationCommand.new
    }
    register('commands.homebrew_context.daggerheart.copy_transformation') {
      HomebrewContext::Daggerheart::CopyTransformationCommand.new
    }
    register('commands.homebrew_context.daggerheart.add_book_transformations') {
      HomebrewContext::Daggerheart::AddBookTransformationsCommand.new
    }

    # services
    register('services.auth_context.validate_web_telegram_signature') { AuthContext::WebTelegramSignatureValidateService.new }

    register('services.webhooks_context.telegram.handle_message_webhook') {
      WebhooksContext::Telegram::HandleMessageWebhookService.new
    }
    register('services.webhooks_context.telegram.handle_chat_member_webhook') {
      WebhooksContext::Telegram::HandleChatMemberWebhookService.new
    }

    register('services.characters_context.daggerheart.refresh_feats') { CharactersContext::Daggerheart::RefreshFeats.new }
    register('services.characters_context.dnd5.refresh_feats') { CharactersContext::Dnd5::RefreshFeats.new }
    register('services.characters_context.dnd2024.refresh_feats') { CharactersContext::Dnd2024::RefreshFeats.new }
    register('services.notifications_context.send_notification') { NotificationsContext::SendService.new }

    register('services.bot_context.handle') { BotContext::HandleService.new }

    register('services.bot_context.handle_command') { BotContext::HandleCommandService.new }
    register('services.bot_context.commands.roll') { BotContext::Commands::Roll.new }
    register('services.bot_context.commands.book') { BotContext::Commands::Book.new }
    register('services.bot_context.commands.homebrew') { BotContext::Commands::Homebrew.new }
    register('services.bot_context.commands.check') { BotContext::Commands::Check.new }
    register('services.bot_context.commands.campaign') { BotContext::Commands::Campaign.new }

    register('services.bot_context.represent_command') { BotContext::RepresentCommandService.new }
    register('services.bot_context.represent_raw_command') { BotContext::RepresentRawCommandService.new }

    register('services.homebrews_context.refresh_user_data') { HomebrewsContext::RefreshUserDataService.new }
  end
end

Deps = Dry::AutoInject(Charkeeper::Container)
