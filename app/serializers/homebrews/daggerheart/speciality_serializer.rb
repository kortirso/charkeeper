# frozen_string_literal: true

module Homebrews
  module Daggerheart
    class SpecialitySerializer < ApplicationSerializer
      attributes :id, :name, :evasion, :health_max, :domains, :features

      delegate :evasion, :health_max, :domains, to: :data
      delegate :data, to: :object

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
