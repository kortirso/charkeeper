# frozen_string_literal: true

module Api
  module V1
    module Characters
      class ItemsController < Api::V1::BaseController
        include SerializeRelation

        INDEX_SERIALIZER_FIELDS = %i[id quantity ready_to_use name kind weight price].freeze

        def index
          render json: serialize_relation(
            items,
            ::Characters::ItemSerializer,
            :items,
            serializer_fields(::Characters::ItemSerializer, INDEX_SERIALIZER_FIELDS)
          ), status: :ok
        end

        private

        def items
          current_user
            .characters
            .find_by(id: params[:character_id])
            .items
            .includes(:item)
            .order('character_items.ready_to_use DESC')
        end
      end
    end
  end
end
