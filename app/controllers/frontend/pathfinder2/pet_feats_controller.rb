# frozen_string_literal: true

module Frontend
  module Pathfinder2
    class PetFeatsController < Frontend::BaseController
      include SerializeRelation

      def index
        serialize_relation_v2(
          relation,
          ::Pathfinder2::FeatSerializer,
          :feats,
          cache_options: cache_options,
          serialized_fields: { only: %i[slug title description origin] },
          order_options: { key: 'title' }
        )
      end

      private

      def cache_options
        { key: "pet_feats/pathfinder2/#{I18n.locale}/v0.4.24", expires_in: 24.hours }
      end

      def relation
        ::Pathfinder2::Feat.where(origin: [9, 10])
      end
    end
  end
end
