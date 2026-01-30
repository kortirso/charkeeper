# frozen_string_literal: true

module Frontend
  module Dnd2024
    class SpellsController < Frontend::BaseController
      include Deps[
        feature_requirement: 'feature_requirement',
        markdown: 'markdown'
      ]
      include SerializeRelation

      before_action :find_spell, only: %i[show]

      def index
        serialize_relation_v2(
          relation, ::Dnd2024::SpellSerializer, :spells, cache_options: {}, order_options: { key: 'title' }
        )
      end

      def show
        render json: { description: markdown.call(value: @spell.description[I18n.locale.to_s], version: '0.4.5') }
      end

      private

      def find_spell
        @spell = ::Dnd2024::Feat.where(origin: 6).find(params[:id])
      end

      def cache_options
        { key: ["spells/dnd2024/#{I18n.locale}/v2", params[:max_level]].compact.join('/'), expires_in: 12.hours }
      end

      def relation
        return [] unless feature_requirement.call(current: params[:version], initial: '0.4.5')

        result = ::Dnd2024::Feat.where(origin: 6)
        result = result.where("info ->> 'level' IN (?)", (0..params[:max_level].to_i).to_a.map(&:to_s)) if params[:max_level]
        result
      end
    end
  end
end
