# frozen_string_literal: true

module WebTelegram
  module Dnd5
    class ItemsController < WebTelegram::BaseController
      include SerializeRelation

      INDEX_SERIALIZER_FIELDS = %i[id kind name weight price data].freeze

      def index
        render json: serialize_relation(
          ::Dnd5::Item.order(kind: :asc),
          ::Dnd5::ItemSerializer,
          :items,
          only: INDEX_SERIALIZER_FIELDS
        ), status: :ok
      end
    end
  end
end
