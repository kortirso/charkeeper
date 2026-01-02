# frozen_string_literal: true

module Frontend
  module Dnd5
    class SpellsController < Frontend::BaseController
      include SerializeRelation

      INDEX_SERIALIZER_FIELDS = %i[id slug name level available_for].freeze

      def index
        serialize_relation_v2(relation, ::Dnd5::SpellSerializer, :spells, cache_options: cache_options)
      end

      private

      def cache_options
        { key: ["spells/dnd5/#{I18n.locale}/v1", params[:max_level]].compact.join('/'), expires_in: 12.hours }
      end

      def relation
        relation = ::Spell.dnd5
        relation = relation.where("data ->> 'level' IN (?)", (0..params[:max_level].to_i).to_a.map(&:to_s)) if params[:max_level]
        relation
      end
    end
  end
end
