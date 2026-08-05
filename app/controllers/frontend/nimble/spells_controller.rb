# frozen_string_literal: true

module Frontend
  module Nimble
    class SpellsController < Frontend::Nimble::BaseController
      include SerializeRelation

      def index
        serialize_relation_v2(
          ::Nimble::Feat.where(origin: 4),
          ::Nimble::SpellSerializer,
          :spells,
          cache_options: { key: "nimble_spells/#{I18n.locale}/0.5.3", expires_in: 24.hours }
        )
      end
    end
  end
end
