# frozen_string_literal: true

module Frontend
  module Dc20
    class AncestriesController < Frontend::BaseController
      include SerializeRelation

      def index
        serialize_relation_v2(::Dc20::Feat.where(origin: 0), ::Dc20::FeatSerializer, :ancestries, cache_options: cache_options)
      end

      private

      def cache_options
        { key: "dc20_ancestries/#{I18n.locale}/v1", expires_in: 24.hours }
      end
    end
  end
end
