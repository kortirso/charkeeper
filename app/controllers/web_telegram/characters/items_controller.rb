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
          index_serializer,
          :items,
          only: INDEX_SERIALIZER_FIELDS
        ), status: :ok
      end

      private

      def find_user_character
        @user_character = current_user.user_characters.find_by(id: params[:character_id])
      end

      def items
        case @user_character.provider
        when ::User::Character::DND5 then dnd5_items
        end
      end

      def dnd5_items
        @user_character
          .characterable
          .items
          .includes(:item)
          .order('dnd5_character_items.ready_to_use DESC')
      end

      def index_serializer
        case @user_character.provider
        when ::User::Character::DND5 then Dnd5::Characters::ItemSerializer
        end
      end
    end
  end
end
