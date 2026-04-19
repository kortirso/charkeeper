# frozen_string_literal: true

module CampaignsContext
  module Items
    class ChangeCommand < BaseCommand
      use_contract do
        config.messages.namespace = :campaign_item

        params do
          required(:campaign_item).filled(type?: ::Campaign::Item)
          optional(:notes).maybe(:string, max_size?: 500)
          optional(:states).hash
        end
      end

      private

      def do_prepare(input)
        input[:states].transform_values!(&:to_i) if input.key?(:states)
      end

      def do_persist(input)
        input[:campaign_item].update!(input.except(:campaign_item))

        { result: input[:campaign_item] }
      end
    end
  end
end
