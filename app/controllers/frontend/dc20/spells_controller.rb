# frozen_string_literal: true

module Frontend
  module Dc20
    class SpellsController < Frontend::BaseController
      include SerializeRelation

      def index
        serialize_relation_v2(
          ::Dc20::Feat.where(origin: 7),
          ::Dc20::SpellSerializer,
          :spells,
          cache_options: { key: 'dc20_spells/v1', expires_in: 24.hours }
        )
      end
    end
  end
end
