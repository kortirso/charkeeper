# frozen_string_literal: true

module CampaignsContext
  module Items
    class AddCommand < BaseCommand
      use_contract do
        States = Dry::Types['strict.string'].enum('hidden', 'shared')

        params do
          required(:campaign).filled(type?: ::Campaign)
          required(:item).filled(type?: ::Item)
          optional(:state).filled(States)
          optional(:name).filled(:string)
          optional(:modifiers).hash
        end
      end

      private

      def lock_key(input) = "campaign_item_add_#{input[:campaign].id}_#{input[:item]&.id}"
      def lock_time = 0

      def do_prepare(input)
        input[:state] ||= 'shared'
      end

      def do_persist(input) # rubocop: disable Metrics/AbcSize
        campaign_item = input.key?(:name) ? nil : ::Campaign::Item.find_by(input.slice(:campaign, :item).merge(name: nil))

        if campaign_item
          campaign_item.update!(
            states: (campaign_item.states.presence || ::Campaign::Item.default_states).merge({
              'shared' => campaign_item.states['shared'].to_i + 1
            }),
            modifiers: campaign_item.modifiers.to_h.merge(input[:modifiers].to_h)
          )
        else
          campaign_item =
            ::Campaign::Item.create!(
              input.except(:state).merge(
                states: ::Campaign::Item.default_states.merge({ input[:state] => 1 })
              )
            )
        end

        { result: campaign_item }
      end
    end
  end
end
