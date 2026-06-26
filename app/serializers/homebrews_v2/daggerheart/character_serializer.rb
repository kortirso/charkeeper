# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class CharacterSerializer < ApplicationSerializer
      attributes :id, :title, :features, :own

      def title
        object.name
      end

      def features
        return [] unless context
        return [] unless context[:features]

        relation = context[:features]
        Panko::ArraySerializer.new(
          relation,
          each_serializer: HomebrewsV2::Daggerheart::FeatSerializer
        ).serialize(relation)
      end

      def own = true # rubocop: disable Naming/PredicateMethod
    end
  end
end
