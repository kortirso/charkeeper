# frozen_string_literal: true

module WebTelegram
  module Characters
    class SpellsController < WebTelegram::BaseController
      # include SerializeRelation

      # INDEX_SERIALIZER_FIELDS = %i[id ready_to_use data name level attacking comment].freeze

      # def index
      #   render json: serialize_relation(
      #     spells,
      #     ::Characters::SpellSerializer,
      #     :spells,
      #     { only: INDEX_SERIALIZER_FIELDS }
      #   ), status: :ok
      # end

      # private

      # def spells
      #   current_user
      #     .characters
      #     .find_by(id: params[:character_id])
      #     .spells
      #     .includes(:spell)
      #     .order('spells.level ASC', 'character_spells.ready_to_use DESC')
      # end
    end
  end
end
