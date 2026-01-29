# frozen_string_literal: true

module Frontend
  module Dnd2024
    class SpellsController < Frontend::BaseController
      include Deps[
        feature_requirement: 'feature_requirement'
      ]
      include SerializeRelation

      def index
        serialize_relation_v2(
          relation, ::Dnd2024::SpellSerializer, :spells, cache_options: {}, order_options: { key: 'title' }
        )
      end

      private

      def cache_options
        { key: ["spells/dnd2024/#{I18n.locale}/v1", params[:max_level]].compact.join('/'), expires_in: 12.hours }
      end

      def relation
        return [] unless feature_requirement.call(current: params[:version], initial: '0.4.5')

        result = ::Dnd2024::Feat.where(origin: ::Dnd2024::Feat::SPELL_ORIGIN)
        result = result.where("info ->> 'level' IN (?)", (0..params[:max_level].to_i).to_a.map(&:to_s)) if params[:max_level]
        result
      end
    end
  end
end
