# frozen_string_literal: true

module Homebrews
  module Daggerheart
    class ItemsController < Homebrews::BaseController
      include Deps[
        add_daggerheart_item: 'commands.homebrew_context.daggerheart.add_item',
        change_daggerheart_item: 'commands.homebrew_context.daggerheart.change_item'
      ]
      include SerializeRelation
      include SerializeResource

      before_action :find_items, only: %i[index]
      before_action :find_item, only: %i[show update destroy]
      before_action :find_item_bonuses, only: %i[index show]

      def index
        serialize_relation(
          @items,
          ::Homebrews::Daggerheart::ItemSerializer,
          :items,
          {},
          { bonuses: @bonuses }
        )
      end

      def show
        serialize_resource(
          @item, ::Homebrews::Daggerheart::ItemSerializer, :item, {}, :ok, { bonuses: @bonuses }
        )
      end

      def create
        case add_daggerheart_item.call(item_params.merge(user: current_user))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(result, ::Homebrews::Daggerheart::ItemSerializer, :item, {}, :created)
        end
      end

      def update
        case change_daggerheart_item.call(item_params.merge(item: @item))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(result, ::Homebrews::Daggerheart::ItemSerializer, :item, {}, :ok)
        end
      end

      def destroy
        @item.destroy
        only_head_response
      end

      private

      def find_items
        @items =
          ::Daggerheart::Item
            .where(kind: params[:kind].split(','), user_id: current_user.id)
            .order(kind: :desc, created_at: :desc)
      end

      def find_item_bonuses
        @bonuses = Character::Bonus.where(bonusable: @items.pluck(:id))
      end

      def find_item
        @item = ::Daggerheart::Item.find_by!(id: params[:id], user_id: current_user.id)
      end

      def item_params
        params.require(:brewery).permit!.to_h
      end
    end
  end
end
