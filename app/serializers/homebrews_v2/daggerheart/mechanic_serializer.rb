# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class MechanicSerializer < ApplicationSerializer
      attributes :id, :items

      def items
        return [] unless context
        return [] unless context[:features]

        relation = object.items.order(created_at: :asc)
        Panko::ArraySerializer.new(
          relation,
          each_serializer: HomebrewsV2::Daggerheart::MechanicItemSerializer,
          context: { features: context[:features] }
        ).serialize(relation)
      end
    end
  end
end
