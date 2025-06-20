# frozen_string_literal: true

module Frontend
  class ItemsController < Frontend::BaseController
    include SerializeRelation

    def index
      serialize_relation(relation, ::ItemSerializer, :items)
    end

    private

    def relation
      case params[:provider]
      when 'dnd5', 'dnd2024' then ::Item.dnd5.order(kind: :asc)
      when 'pathfinder2' then ::Item.pathfinder2.order(kind: :asc)
      when 'daggerheart' then ::Item.daggerheart.order(kind: :asc)
      else raise(ActiveRecord::RecordNotFound)
      end
    end
  end
end
