# frozen_string_literal: true

module Frontend
  module Daggerheart
    class SpellsController < Frontend::BaseController
      include SerializeRelation

      INDEX_SERIALIZER_FIELDS = %i[id slug name level domain].freeze

      def index
        serialize_relation(relation, ::Daggerheart::SpellSerializer, :spells, only: INDEX_SERIALIZER_FIELDS)
      end

      private

      def relation
        relation = ::Spell.daggerheart
        relation = relation.where("data ->> 'domain' IN (?)", params[:domains].split(',')) if params[:domains]
        relation = relation.where("data ->> 'level' IN (?)", (0..params[:max_level].to_i).to_a) if params[:max_level]
        relation
      end
    end
  end
end
