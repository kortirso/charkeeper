# frozen_string_literal: true

module BotContext
  module Commands
    class Campaign
      include Deps[
        add_campaign_command: 'commands.campaigns_context.add_campaign',
        remove_campaign_command: 'commands.campaigns_context.remove_campaign',
        add_channel: 'commands.channels_context.add_channel'
      ]

      TELEGRAM_SOURCES = %i[telegram_bot telegram_group_bot].freeze

      def call(source:, arguments:, data:)
        return if data[:user].nil?

        case arguments.shift
        when 'create' then create_campaign(*arguments, data)
        when 'list' then fetch_campaigns(data)
        when 'remove' then remove_campaign(*arguments, data)
        when 'show' then show_active_campaign(data, source)
        when 'set' then set_campaign(*arguments, data, source)
        end
      end

      private

      def create_campaign(*arguments, data) # rubocop: disable Metrics/AbcSize
        values = BotContext::Commands::Parsers::CreateCampaign.new.call(arguments: arguments)
        result = add_campaign_command.call(user: data[:user], name: values[:name], provider: values[:system])

        if result[:errors_list].blank?
          external_id = data.dig(:raw_message, :chat, :id)
          if external_id
            channel = add_channel.call(provider: 'telegram', external_id: external_id.to_s)[:result]

            result[:result].campaign_channels.create(channel: channel) if channel.campaign.blank?
          end
        end

        {
          type: 'create',
          result: result[:result],
          errors: result[:errors_list]
        }
      end

      def fetch_campaigns(data)
        {
          type: 'list',
          result: data[:user].campaigns.hashable_pluck(:name, :provider),
          errors: nil
        }
      end

      def remove_campaign(name, data)
        result = remove_campaign_command.call(user: data[:user], name: name)
        {
          type: 'remove',
          result: result[:result],
          errors: result[:errors_list]
        }
      end

      def show_active_campaign(data, source)
        return unless source.in?(TELEGRAM_SOURCES)

        external_id = data.dig(:raw_message, :chat, :id)
        channel = add_channel.call(provider: 'telegram', external_id: external_id.to_s)[:result]

        {
          type: 'show',
          result: channel.campaign,
          errors: nil
        }
      end

      def set_campaign(name, data, source)
        return unless source.in?(TELEGRAM_SOURCES)

        external_id = data.dig(:raw_message, :chat, :id)
        channel = add_channel.call(provider: 'telegram', external_id: external_id.to_s)[:result]

        if channel.campaign.blank?
          data[:user].campaigns.find_by!(name: name).campaign_channels.create(channel: channel)
        end
        {
          type: 'set',
          result: channel.campaign,
          errors: nil
        }
      end
    end
  end
end
