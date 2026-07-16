# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class AncestrySerializer < ApplicationSerializer
      attributes :id, :features

      def features
        return [] unless context
        return [] unless context[:features]

        relation = context[:features].order(created_at: :asc)
        Panko::ArraySerializer.new(
          relation,
          each_serializer: HomebrewsV2::Daggerheart::FeatSerializer
        ).serialize(relation)
      end
    end
  end
end
