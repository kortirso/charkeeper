# frozen_string_literal: true

module Frontend
  module Dc20
    class WildFormsController < Frontend::Dc20::BaseController
      include SerializeRelation

      def index
        serialize_relation_v2(relation, ::Dc20::FeatSerializer, :features, cache_options: cache_options)
      end

      private

      def relation
        ::Dc20::Feat.where(origin: 0, origin_value: 'beastborn')
          .or(::Dc20::Feat.where(origin: 10))
      end

      def cache_options
        { key: "dc20_wild_forms/#{I18n.locale}/v1", expires_in: 24.hours }
      end
    end
  end
end
