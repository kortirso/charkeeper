# frozen_string_literal: true

module WebTelegram
  module Characters
    class ItemsController < WebTelegram::BaseController
      include SerializeRelation

      INDEX_SERIALIZER_FIELDS = %i[id quantity ready_to_use name kind weight price].freeze

      before_action :find_user_character

      def index
        render json: serialize_relation(
          items,
          ::Characters::ItemSerializer,
          :items,
          only: INDEX_SERIALIZER_FIELDS
        ), status: :ok
      end

      private

      def find_user_character
        @user_character ||= current_user.user_characters.find_by(id: params[:character_id])
      end

      def items
        @user_character
          .characterable
          .items
          .includes(:item)
          .order('dnd5_character_items.ready_to_use DESC')
      end
    end
  end
end
