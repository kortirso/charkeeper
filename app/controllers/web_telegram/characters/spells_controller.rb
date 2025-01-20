# frozen_string_literal: true

module WebTelegram
  module Characters
    class SpellsController < WebTelegram::BaseController
      include SerializeRelation

      INDEX_SERIALIZER_FIELDS = %i[id ready_to_use prepared_by name level attacking comment].freeze

      before_action :find_user_character

      def index
        render json: serialize_relation(
          spells,
          ::Characters::SpellSerializer,
          :spells,
          only: INDEX_SERIALIZER_FIELDS
        ), status: :ok
      end

      private

      def find_user_character
        @user_character ||= current_user.user_characters.find_by(id: params[:character_id])
      end

      def spells
        @user_character
          .characterable
          .spells
          .includes(:spell)
          .order('dnd5_spells.level ASC', 'dnd5_character_spells.ready_to_use DESC')
      end
    end
  end
end
