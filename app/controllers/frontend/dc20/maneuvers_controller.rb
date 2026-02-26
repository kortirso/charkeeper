# frozen_string_literal: true

module Frontend
  module Dc20
    class ManeuversController < Frontend::BaseController
      include SerializeRelation

      def index
        serialize_relation(::Dc20::Feat.where(origin: 3), ::Dc20::FeatSerializer, :maneuvers, { except: %i[description price] })
      end
    end
  end
end
