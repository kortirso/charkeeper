# frozen_string_literal: true

module WebTelegram
  module Dnd5
    class ItemsController < WebTelegram::BaseController
      include SerializeRelation

      INDEX_SERIALIZER_FIELDS = %i[id slug kind name data].freeze

      def index
        render json: serialize_relation(
          ::Item.dnd5.order(kind: :asc),
          ::Dnd5::ItemSerializer,
          :items,
          only: INDEX_SERIALIZER_FIELDS
        ), status: :ok
      end
    end
  end
end
