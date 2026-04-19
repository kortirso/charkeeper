# frozen_string_literal: true

module CampaignsContext
  module Items
    class SendCommand < BaseCommand
      use_contract do
        config.messages.namespace = :campaign_item

        States = Dry::Types['strict.string'].enum('hidden', 'shared')

        params do
          required(:campaign_item).filled(type?: ::Campaign::Item)
          required(:state).filled(States)
          required(:amount).filled(:integer, gteq?: 1)
          required(:character_id).filled(:string)
        end
      end

      private

      def do_persist(_input)
        { result: :ok }
      end
    end
  end
end
