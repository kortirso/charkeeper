# frozen_string_literal: true

module Frontend
  class ItemsController < Frontend::BaseController
    include Deps[
      feature_requirement: 'feature_requirement'
    ]
    include SerializeRelation

    def index
      serialize_relation_v2(items, ::ItemSerializer, :items, cache_options: cache_options)
    end

    private

    def cache_options
      return {} unless feature_requirement.call(current: params[:version], initial: '0.3.26')
      return {} if params[:homebrew]

      { key: "items/#{params[:provider]}/#{I18n.locale}/v1", expires_in: 12.hours }
    end

    def items # rubocop: disable Metrics/AbcSize
      if feature_requirement.call(current: params[:version], initial: '0.3.26')
        if params[:homebrew]
          relation.visible.where(user_id: current_user.id).or(relation.visible.where(id: homebrew_item_ids))
        else
          relation.visible.where(user_id: nil)
        end
      else
        relation.visible.where(user_id: [nil, current_user.id]).or(relation.visible.where(id: homebrew_item_ids))
      end
    end

    def relation
      case params[:provider]
      when 'dnd5', 'dnd2024' then ::Item.dnd5.order(kind: :asc)
      when 'pathfinder2' then ::Item.pathfinder2.order(kind: :asc)
      when 'daggerheart' then ::Item.daggerheart.order(kind: :asc)
      when 'dc20' then ::Item.dc20.order(kind: :asc)
      else raise(ActiveRecord::RecordNotFound)
      end
    end

    def homebrew_item_ids
      return [] unless params[:provider] == 'daggerheart'

      ::Homebrew::Book::Item
        .where(homebrew_book_id: ::User::Book.where(user_id: current_user).select(:homebrew_book_id))
        .where(itemable_type: itemable_type)
        .pluck(:itemable_id)
    end

    def itemable_type
      case params[:provider]
      when 'dnd5', 'dnd2024' then 'Dnd5::Item'
      when 'pathfinder2' then 'Pathfinder2::Item'
      when 'daggerheart' then 'Daggerheart::Item'
      when 'dc20' then 'Dc20::Item'
      end
    end
  end
end
