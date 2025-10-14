# frozen_string_literal: true

module BotContext
  module Commands
    class Character
      include Deps[
        add_channel: 'commands.channels_context.add_channel',
        join_campaign_command: 'commands.campaigns_context.join_campaign'
      ]

      TELEGRAM_SOURCES = %i[telegram_bot telegram_group_bot].freeze

      def call(source:, arguments:, data:)
        return if data[:user].nil?

        case arguments.shift
        when 'list' then fetch_characters(data)
        when 'joinCampaign' then join_campaign(*arguments, data, source)
        end
      end

      private

      def fetch_characters(data)
        {
          type: 'list',
          result: data[:user].characters.pluck(:name),
          errors: nil
        }
      end

      def join_campaign(name, data, source)
        return unless source.in?(TELEGRAM_SOURCES)

        character = data[:user].characters.find_by(name: name)
        return unless character

        external_id = data.dig(:raw_message, :chat, :id)
        channel = add_channel.call(provider: 'telegram', external_id: external_id.to_s)[:result]
        return if channel.campaign.blank?

        result = join_campaign_command.call(character: character, campaign: channel.campaign)
        {
          type: 'join_campaign',
          result: result[:result],
          errors: nil
        }
      end
    end
  end
end
