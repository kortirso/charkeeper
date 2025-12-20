# frozen_string_literal: true

module Homebrews
  class ItemsController < Homebrews::BaseController
    include SerializeRelation
    include SerializeResource

    before_action :find_items, only: %i[index]
    before_action :find_item, only: %i[show update destroy]
    before_action :find_item_bonuses, only: %i[index show]

    def index
      serialize_relation(@items, serializer, :items, {}, { bonuses: @bonuses })
    end

    def show
      serialize_resource(@item, serializer, :item, {}, :ok, { bonuses: @bonuses })
    end

    def create
      case add_item.call(item_params.merge(user: current_user, bonuses: bonuses_params))
      in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
      in { result: result }
        serialize_resource(result, serializer, :item, {}, :created, { bonuses: result.bonuses })
      end
    end

    def update
      case change_item.call(item_params.merge(item: @item, bonuses: bonuses_params))
      in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
      in { result: result }
        serialize_resource(result, serializer, :item, {}, :ok)
      end
    end

    def destroy
      @item.destroy
      only_head_response
    end

    private

    def find_items
      @items =
        item_class
          .where(kind: params[:kind].split(','), user_id: current_user.id)
          .order(kind: :desc, created_at: :desc)
    end

    def find_item_bonuses
      @bonuses = Character::Bonus.where(bonusable: @items.pluck(:id))
    end

    def find_item
      @item = item_class.find_by!(id: params[:id], user_id: current_user.id)
    end

    def item_params
      params.require(:brewery).permit!.to_h
    end

    def bonuses_params
      params.permit![:bonuses].to_a.map { |item| item.to_h.deep_symbolize_keys }
    end
  end
end
