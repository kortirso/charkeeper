# frozen_string_literal: true

module Frontend
  module Daggerheart
    class SpellsController < Frontend::BaseController
      include SerializeRelation

      def index
        serialize_relation(relation, ::FeatSerializer, :spells)
      end

      private

      def relation # rubocop: disable Metrics/AbcSize
        return [] if params[:version].blank?

        relation = ::Daggerheart::Feat.where(origin: 'domain_card')
        relation =
          relation.where(user_id: nil).or(
            relation
              .where.not(user_id: nil)
              .where(origin_value: (current_user.user_homebrew&.data&.dig('daggerheart', 'domains') || {}).keys)
          )
        relation = relation.where(origin_value: params[:domains].split(',')) if params[:domains]
        relation = relation.where("conditions ->> 'level' IN (?)", (0..params[:max_level].to_i).to_a.map(&:to_s)) if params[:max_level] # rubocop: disable Layout/LineLength
        relation
      end
    end
  end
end
