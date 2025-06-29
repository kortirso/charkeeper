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

    register('commands.characters_context.dnd5.create') { CharactersContext::Dnd5::CreateCommand.new }
    register('commands.characters_context.dnd5.update') { CharactersContext::Dnd5::UpdateCommand.new }
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
    register('commands.characters_context.pathfinder2.change_health') { CharactersContext::Pathfinder2::ChangeHealthCommand.new }

    register('commands.characters_context.daggerheart.create') { CharactersContext::Daggerheart::CreateCommand.new }
    register('commands.characters_context.daggerheart.update') { CharactersContext::Daggerheart::UpdateCommand.new }
    register('commands.characters_context.daggerheart.add_bonus') { CharactersContext::Daggerheart::AddBonusCommand.new }
    register('commands.characters_context.daggerheart.add_spell') { CharactersContext::Daggerheart::AddSpellCommand.new }
    register('commands.characters_context.daggerheart.change_spell') { CharactersContext::Daggerheart::ChangeSpellCommand.new }

    register('commands.image_processing.attach_avatar_by_file') { ImageProcessingContext::AttachAvatarByFileCommand.new }
    register('commands.image_processing.attach_avatar_by_url') { ImageProcessingContext::AttachAvatarByUrlCommand.new }

    register('commands.webhooks_context.receive_telegram_message_webhook') {
      WebhooksContext::ReceiveTelegramMessageWebhookCommand.new
    }
    register('commands.webhooks_context.receive_telegram_chat_member_webhook') {
      WebhooksContext::ReceiveTelegramChatMemberWebhookCommand.new
    }

    # services
    register('services.auth_context.validate_web_telegram_signature') { AuthContext::WebTelegramSignatureValidateService.new }
    register('services.webhooks_context.handle_telegram_message_webhook') {
      WebhooksContext::HandleTelegramMessageWebhookService.new
    }
    register('services.webhooks_context.handle_telegram_chat_member_webhook') {
      WebhooksContext::HandleTelegramChatMemberWebhookService.new
    }
  end
end

Deps = Dry::AutoInject(Charkeeper::Container)
