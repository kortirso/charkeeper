# frozen_string_literal: true

module Frontend
  module Pathfinder2
    class SpellsController < Frontend::BaseController
      include Deps[markdown: 'markdown']
      include SerializeRelation

      before_action :find_spell, only: %i[show]

      def index
        serialize_relation_v2(relation, ::Pathfinder2::SpellSerializer, :spells, cache_options: cache_options)
      end

      def show
        render json: { description: markdown.call(value: @spell.description[I18n.locale.to_s], version: '0.4.5') }
      end

      private

      def find_spell
        @spell = ::Pathfinder2::Feat.where(origin: 4).find(params[:id])
      end

      def cache_options
        { key: ["spells/pathfinder2/#{I18n.locale}/v0.4.24", params[:max_level]].compact.join('/'), expires_in: 12.hours }
      end

      def relation
        result = ::Pathfinder2::Feat.where(origin: 4)
        result.where("info ->> 'level' IN (?)", (0..params[:max_level].to_i).to_a.map(&:to_s)) if params[:max_level]
        result
      end
    end
  end
end
