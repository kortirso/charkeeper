# frozen_string_literal: true

module WebTelegram
  class ItemsController < WebTelegram::BaseController
    include SerializeRelation

    def index
      render json: serialize_relation(relation, ::ItemSerializer, :items), status: :ok
    end

    private

    def relation
      case params[:provider]
      when 'dnd5', 'dnd2024' then ::Item.dnd5.order(kind: :asc)
      when 'pathfinder2' then ::Item.pathfinder2.order(kind: :asc)
      when 'daggerheart' then ::Item.daggerheart.order(kind: :asc)
      else []
      end
    end
  end
end
