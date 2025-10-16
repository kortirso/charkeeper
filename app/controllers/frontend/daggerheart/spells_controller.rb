# frozen_string_literal: true

module Frontend
  module Daggerheart
    class SpellsController < Frontend::BaseController
      include SerializeRelation

      def index
        serialize_relation(relation, ::FeatSerializer, :spells)
      end

      private

      def relation
        return [] if params[:version].blank?

        relation = ::Daggerheart::Feat.where(origin: 'domain_card')
        relation = relation.where(origin_value: params[:domains].split(',')) if params[:domains]
        relation = relation.where("conditions ->> 'level' IN (?)", (0..params[:max_level].to_i).to_a.map(&:to_s)) if params[:max_level] # rubocop: disable Layout/LineLength
        relation
      end
    end
  end
end
