# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class DomainSerializer < ApplicationSerializer
      attributes :id, :features

      def features
        return [] unless context
        return [] unless context[:features]

        relation = context[:features]
        Panko::ArraySerializer
          .new(relation, each_serializer: HomebrewsV2::Daggerheart::FeatSerializer)
          .serialize(relation)
          .sort_by! { |item| item.dig('conditions', 'level') }
      end
    end
  end
end
