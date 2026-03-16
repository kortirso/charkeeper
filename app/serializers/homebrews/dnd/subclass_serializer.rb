# frozen_string_literal: true

module Homebrews
  module Dnd
    class SubclassSerializer < ApplicationSerializer
      attributes :id, :name, :class_name, :public, :own, :features

      def features
        return [] unless context
        return [] unless context[:features]

        relation = context[:features].select { |item| item.origin_value == object.id }
        Panko::ArraySerializer.new(
          relation,
          each_serializer: Homebrews::FeatSerializer
        ).serialize(relation)
      end

      def own # rubocop: disable Naming/PredicateMethod
        return false unless context
        return false unless context[:current_user_id]

        object.user_id == context[:current_user_id]
      end
    end
  end
end
