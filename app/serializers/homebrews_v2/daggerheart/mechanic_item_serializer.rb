# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class MechanicItemSerializer < ApplicationSerializer
      attributes :id, :title, :description, :tier, :features

      def tier
        object.info.tier
      end

      def title
        translate(object.title)
      end

      def description
        Charkeeper::Container.resolve('markdown').call(value: translate(object.description), version: '0.4.4')
      end

      def features
        return [] unless context
        return [] unless context[:features]

        relation = context[:features].select { |item| item.origin_value == object.id }
        Panko::ArraySerializer.new(
          relation,
          each_serializer: HomebrewsV2::Daggerheart::FeatSerializer
        ).serialize(relation)
      end
    end
  end
end
