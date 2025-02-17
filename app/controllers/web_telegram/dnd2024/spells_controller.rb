# frozen_string_literal: true

module WebTelegram
  module Dnd2024
    class SpellsController < WebTelegram::BaseController
      include SerializeRelation

      INDEX_SERIALIZER_FIELDS = %i[id slug name level available_for].freeze

      def index
        render json: serialize_relation(
          ::Spell.dnd2024,
          ::Dnd2024::SpellSerializer,
          :spells,
          only: INDEX_SERIALIZER_FIELDS
        ), status: :ok
      end
    end
  end
end
