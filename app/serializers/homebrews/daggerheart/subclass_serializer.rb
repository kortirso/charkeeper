# frozen_string_literal: true

module Homebrews
  module Daggerheart
    class SubclassSerializer < ApplicationSerializer
      attributes :id, :name, :class_name, :features, :spellcast, :mechanics, :public, :own

      delegate :spellcast, :mechanics, to: :data
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

      def own
        return [] unless context
        return [] unless context[:current_user_id]

        object.user_id == context[:current_user_id]
      end
    end
  end
end
