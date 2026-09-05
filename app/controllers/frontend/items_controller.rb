# frozen_string_literal: true

module Frontend
  class ItemsController < Frontend::BaseController
    include Deps[feature_requirement: 'feature_requirement']
    include SerializeRelation

    PROVIDERS_WITH_HOMEBREWS = %w[daggerheart nimble dnd5 dnd2024 pathfinder2 cosmere].freeze

    def index
      serialize_relation_v2(items.visible.kept, ::ItemSerializer, :items, cache_options: cache_options)
    end

    private

    def cache_options
      return {} unless feature_requirement.call(current: params[:version], initial: '0.3.26')
      return {} if params[:homebrew]

      { key: "items/#{params[:provider]}/#{I18n.locale}/v7", expires_in: 12.hours }
    end

    def items # rubocop: disable Metrics/AbcSize
      if feature_requirement.call(current: params[:version], initial: '0.3.26')
        if params[:homebrew]
          relation.where(user_id: current_user.id).or(relation.where(id: homebrew_item_ids))
        else
          relation.where(user_id: nil)
        end
      else
        relation.where(user_id: [nil, current_user.id]).or(relation.where(id: homebrew_item_ids))
      end
    end

    def relation
      case params[:provider]
      when 'dnd5', 'dnd2024' then ::Item.dnd5.order(kind: :asc)
      when 'pathfinder2' then ::Item.pathfinder2.order(kind: :asc)
      when 'daggerheart' then ::Item.daggerheart.order(kind: :asc)
      when 'dc20' then ::Item.dc20.order(kind: :asc)
      when 'fallout' then ::Item.fallout.order(kind: :asc)
      when 'cosmere' then ::Item.cosmere
      when 'nimble' then ::Item.nimble
      when 'cthulhu7' then ::Item.none
      else raise(ActiveRecord::RecordNotFound)
      end
    end

    def homebrew_item_ids
      return [] if PROVIDERS_WITH_HOMEBREWS.exclude?(params[:provider])

      ::Homebrew::Book::Item
        .where(homebrew_book_id: ::User::Book.where(user_id: current_user).select(:homebrew_book_id))
        .where(itemable_type: 'Item')
        .pluck(:itemable_id)
    end
  end
end
