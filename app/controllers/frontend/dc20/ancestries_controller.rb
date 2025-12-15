# frozen_string_literal: true

module Frontend
  module Dc20
    class AncestriesController < Frontend::BaseController
      include SerializeRelation

      def index
        serialize_relation(::Dc20::Feat.where(origin: 0), ::Dc20::FeatSerializer, :ancestries)
      end
    end
  end
end
