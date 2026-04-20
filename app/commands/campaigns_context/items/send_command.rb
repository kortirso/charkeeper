# frozen_string_literal: true

module CampaignsContext
  module Items
    class SendCommand < BaseCommand
      include Deps[
        character_item_add: 'commands.characters_context.items.add',
        change_item: 'commands.campaigns_context.items.change'
      ]

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

      def validate_content(input)
        input[:states] = input[:campaign_item].states.merge({ input[:state] => input[:amount] }, &merge_diff)
        if input[:states].values.any?(&:negative?)
          return [I18n.t('commands.campaigns_context.items.not_enough_items')]
        end

        input[:character] = Character.find_by(id: input[:character_id])
        return if input[:character]

        [I18n.t('commands.campaigns_context.items.character_not_found')]
      end

      def do_persist(input)
        ActiveRecord::Base.transaction do
          change_item.call(campaign_item: input[:campaign_item], states: input[:states])
          character_item_add.call(
            {
              character: input[:character],
              item: input[:campaign_item].item,
              name: input[:campaign_item].name,
              modifiers: input[:campaign_item].modifiers
            }.compact
          )
        end

        { result: :ok }
      end

      def merge_diff = proc { |_, oldval, newval| oldval.to_i - newval }
    end
  end
end
