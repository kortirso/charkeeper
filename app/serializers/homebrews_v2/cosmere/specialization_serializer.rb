# frozen_string_literal: true

module HomebrewsV2
  module Cosmere
    class SpecializationSerializer < ApplicationSerializer
      attributes :id, :features, :only, :origin_class

      def only
        Charkeeper::Container.resolve('cache.cosmere_names')
          .fetch_list[:settings].slice(*object.info.only)
          .values.map { |item| translate(item[:name]) }
      end

      def origin_class
        object.info.origin_class
      end

      def features
        return [] unless context
        return [] unless context[:features]

        relation = context[:features].order(created_at: :asc)
        Panko::ArraySerializer.new(
          relation,
          each_serializer: HomebrewsV2::Cosmere::FeatSerializer
        ).serialize(relation)
      end
    end
  end
end
