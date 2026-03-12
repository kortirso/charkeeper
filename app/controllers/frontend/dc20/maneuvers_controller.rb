# frozen_string_literal: true

module Frontend
  module Dc20
    class ManeuversController < Frontend::Dc20::BaseController
      include SerializeRelation

      def index
        serialize_relation_v2(
          ::Dc20::Feat.where(origin: 3),
          ::Dc20::FeatSerializer,
          :maneuvers,
          cache_options: { key: "dc20_maneuvers/#{I18n.locale}/v2", expires_in: 24.hours },
          serialized_fields: { except: %i[description price] }
        )
      end
    end
  end
end
