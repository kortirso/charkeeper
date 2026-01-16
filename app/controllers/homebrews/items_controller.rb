# frozen_string_literal: true

module Homebrews
  class ItemsController < Homebrews::BaseController
    include SerializeRelation
    include SerializeResource

    before_action :find_items, only: %i[index]
    before_action :find_item, only: %i[show update destroy]
    before_action :find_item_bonuses, only: %i[index show]
    before_action :find_another_item, only: %i[copy]

    def index
      serialize_relation(@items, serializer, :items, {}, { bonuses: @bonuses, current_user_id: current_user.id })
    end

    def show
      serialize_resource(@item, serializer, :item, {}, :ok, { bonuses: @bonuses })
    end

    def create
      case add_item.call(item_params.merge(user: current_user, bonuses: bonuses_params, consume: consume_params))
      in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
      in { result: result }
        serialize_resource(result, serializer, :item, {}, :created, { bonuses: result.bonuses, current_user_id: current_user.id })
      end
    end

    def update
      case change_item.call(item_params.merge(item: @item, bonuses: bonuses_params, consume: consume_params))
      in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
      in { result: result } then serialize_resource(result, serializer, :item, {}, :ok)
      end
    end

    def destroy
      @item.destroy
      only_head_response
    end

    def copy
      case copy_item.call({ item: @item, user: current_user })
      in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
      in { result: result } then serialize_resource(result, serializer, :item, {}, :created)
      end
    end

    private

    def find_items
      return @items = all_available_items if params[:kind].blank?

      relation = item_class.where(kind: params[:kind].split(','))
      @items =
        relation.where(user_id: current_user.id)
          .or(
            relation.where.not(user_id: current_user.id).where(public: true)
          )
          .order(kind: :desc, created_at: :desc)
    end

    def all_available_items
      item_class.where(user_id: [nil, current_user.id]).order(kind: :desc, created_at: :desc)
    end

    def find_item_bonuses
      @bonuses = Character::Bonus.where(bonusable_id: @items ? @items.pluck(:id) : @item.id)
    end

    def find_item
      @item = item_class.find_by!(id: params[:id], user_id: current_user.id)
    end

    def find_another_item
      @item = item_class.where.not(user_id: current_user.id).find(params[:id])
    end

    def item_params
      params.require(:brewery).permit!.to_h
    end

    def bonuses_params
      params.permit![:bonuses].to_a.map { |item| item.to_h.deep_symbolize_keys }
    end

    def consume_params
      params.permit![:consume].to_a.map { |item| item.to_h.deep_symbolize_keys }
    end
  end
end
