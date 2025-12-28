# frozen_string_literal: true

module Frontend
  module Dc20
    class SpellsController < Frontend::BaseController
      include SerializeRelation

      def index
        serialize_relation(relation, ::Dc20::SpellSerializer, :spells)
      end

      private

      def relation
        ::Dc20::Feat.where(origin: 7)
      end
    end
  end
end
