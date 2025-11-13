# frozen_string_literal: true

module Homebrews
  module Daggerheart
    class AncestrySerializer < ApplicationSerializer
      attributes :id, :name, :features

      def features
        return [] unless context
        return [] unless context[:features]
        return [] unless context[:bonuses]

        resp = Panko::ArraySerializer.new(
          context[:features].select { |item| item.origin_value == object.id },
          each_serializer: Homebrews::FeatSerializer,
          context: { bonuses: context[:bonuses] }
        )
        JSON.parse(resp.to_json)
      end
    end
  end
end
