# frozen_string_literal: true

module Frontend
  module Homebrews
    class ItemsController < Frontend::BaseController
      include Deps[add_daggerheart_item: 'commands.homebrew_context.daggerheart.add_item']
      include SerializeRelation
      include SerializeResource

      before_action :find_items, only: %i[index]
      before_action :find_item, only: %i[destroy]

      def index
        serialize_relation(@items, serializer, :items)
      end

      def create
        case add_service.call(create_params.merge(user: current_user))
        in { errors: errors } then unprocessable_response(errors)
        in { result: result } then serialize_resource(result, serializer, :item, {}, :created)
        end
      end

      def destroy
        @item.destroy
        only_head_response
      end

      private

      def find_items
        @items = items_relation.where(user_id: current_user.id)
      end

      def find_item
        @item = items_relation.find_by!(id: params[:id], user_id: current_user.id)
      end

      def create_params
        params.require(:brewery).permit!.to_h
      end

      def add_service
        case params[:provider]
        when 'daggerheart' then add_daggerheart_item
        end
      end

      def serializer
        case params[:provider]
        when 'daggerheart' then ::Daggerheart::Homebrew::ItemSerializer
        end
      end

      def items_relation
        case params[:provider]
        when 'daggerheart' then ::Daggerheart::Item
        else []
        end
      end
    end
  end
end
