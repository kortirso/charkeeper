# frozen_string_literal: true

module WebTelegram
  module Dnd5
    class SpellsController < WebTelegram::BaseController
      include SerializeRelation

      INDEX_SERIALIZER_FIELDS = %i[id name level attacking available_for].freeze

      def index
        render json: serialize_relation(
          ::Dnd5::Spell.order(level: :asc),
          ::Dnd5::SpellSerializer,
          :spells,
          only: INDEX_SERIALIZER_FIELDS
        ), status: :ok
      end
    end
  end
end
