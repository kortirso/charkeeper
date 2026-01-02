# frozen_string_literal: true

module Frontend
  module Dnd2024
    class SpellsController < Frontend::BaseController
      include SerializeRelation

      def index
        serialize_relation_v2(relation, ::Dnd2024::SpellSerializer, :spells, cache_options: cache_options)
      end

      private

      def cache_options
        { key: ["spells/dnd2024/#{I18n.locale}/v1", params[:max_level]].compact.join('/'), expires_in: 12.hours }
      end

      def relation
        relation = ::Spell.dnd2024
        relation = relation.where("data ->> 'level' IN (?)", (0..params[:max_level].to_i).to_a.map(&:to_s)) if params[:max_level]
        relation.order(order_by)
      end

      def order_by
        return Arel.sql("name->>'ru' COLLATE \"ru_RU.UTF-8\" ASC") if I18n.locale == :ru

        Arel.sql("name->>'#{I18n.locale}' ASC")
      end
    end
  end
end
