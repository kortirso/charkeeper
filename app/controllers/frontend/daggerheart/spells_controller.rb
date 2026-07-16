# frozen_string_literal: true

module Frontend
  module Daggerheart
    class SpellsController < Frontend::Daggerheart::BaseController
      include SerializeRelation

      def index
        serialize_relation(
          spells, ::Daggerheart::SpellSerializer, :spells, {}, { gsub: true, extra_domains: extra_domains }
        )
      end

      private

      def spells # rubocop: disable Metrics/AbcSize
        return [] if params[:version].blank?

        relation = ::Daggerheart::Feat.where(origin: 'domain_card').where.not(origin_value: '')
        relation =
          if using_homebrew_domains.blank?
            relation.where(user_id: nil)
          else
            relation.where(user_id: nil).or(
              relation.where.not(user_id: nil).where(origin_value: using_homebrew_domains)
            )
          end
        relation = relation.where(origin_value: params.expect(:domains).split(',')) if params[:domains]
        relation = relation.where("conditions ->> 'level' IN (?)", (0..params[:max_level].to_i).to_a.map(&:to_s)) if params[:max_level] # rubocop: disable Layout/LineLength
        relation
      end

      def extra_domains
        return {} if using_homebrew_domains.blank?

        ::Daggerheart::Homebrews::Domain
          .where(id: using_homebrew_domains)
          .pluck(:id, :info).to_h
          .transform_values { |value| value['domain_id'] }
          .compact_blank
      end

      def using_homebrew_domains
        @using_homebrew_domains ||= (current_user.user_homebrew&.data&.dig('daggerheart', 'domains') || {}).keys
      end
    end
  end
end
