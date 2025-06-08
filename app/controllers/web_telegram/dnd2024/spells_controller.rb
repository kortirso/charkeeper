# frozen_string_literal: true

module WebTelegram
  module Dnd2024
    class SpellsController < WebTelegram::BaseController
      include SerializeRelation

      INDEX_SERIALIZER_FIELDS = %i[id slug name level available_for].freeze

      def index
        serialize_relation(relation, ::Dnd2024::SpellSerializer, :spells, only: INDEX_SERIALIZER_FIELDS)
      end

      private

      def relation
        relation = ::Spell.dnd2024
        relation = relation.where("data ->> 'level' <= ?", params[:max_level]) if params[:max_level]
        relation
      end
    end
  end
end
