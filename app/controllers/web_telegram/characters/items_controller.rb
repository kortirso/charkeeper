# frozen_string_literal: true

module WebTelegram
  module Characters
    class ItemsController < WebTelegram::BaseController
      include SerializeRelation

      INDEX_SERIALIZER_FIELDS = %i[id quantity ready_to_use name kind weight price].freeze

      def index
        render json: serialize_relation(
          items,
          ::Characters::ItemSerializer,
          :items,
          { only: INDEX_SERIALIZER_FIELDS }
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
