# frozen_string_literal: true

module Frontend
  module Campaigns
    class ItemsController < Frontend::BaseController
      include Deps[
        add_item: 'commands.campaigns_context.items.add',
        change_item: 'commands.campaigns_context.items.change',
        send_item_command: 'commands.campaigns_context.items.send',
        to_bool: 'to_bool'
      ]
      include SerializeRelation

      before_action :find_campaign
      before_action :find_campaign_item, only: %i[update destroy]
      before_action :find_campaign_item_for_send, only: %i[send_item]
      before_action :find_character_item, only: %i[send_item]

      def index
        serialize_relation_v2(items, ::Campaigns::ItemSerializer, :items)
      end

      def create
        case add_item.call(create_params)
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        else only_head_response
        end
      end

      def update
        case change_item.call(update_params.merge({ campaign_item: @campaign_item }))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        else only_head_response
        end
      end

      def destroy
        @campaign_item.destroy
        only_head_response
      end

      def send_item
        case send_item_command.call(
          update_params.merge(
            { campaign_item: @campaign_item, character_item: @character_item, campaign: @campaign }.compact
          )
        )
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        else only_head_response
        end
      end

      private

      def find_campaign
        @campaign = Campaign.find(params[:campaign_id])
      end

      def find_campaign_item
        @campaign_item = @campaign.items.find(params[:id])
      end

      def find_campaign_item_for_send
        return unless to_bool.call(params[:character_item][:for_campaign])

        @campaign_item = @campaign.items.find(params[:id])
      end

      def find_character_item
        return if to_bool.call(params[:character_item][:for_campaign])

        @character_item = Character::Item.find(params[:id])
      end

      def items
        @campaign.items.includes(item: :bonuses)
      end

      def create_params
        {
          campaign: @campaign,
          item: items_relation.find(params[:item_id])
        }
      end

      def update_params
        params.require(:character_item).permit!.to_h
      end

      def items_relation
        case params[:provider]
        when 'dnd5', 'dnd2024' then ::Item.dnd
        when 'pathfinder2' then ::Item.pathfinder2
        when 'daggerheart' then ::Item.daggerheart
        when 'dc20' then ::Item.dc20
        when 'fallout' then ::Item.fallout
        else []
        end
      end
    end
  end
end
