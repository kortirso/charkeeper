# frozen_string_literal: true

module Homebrews
  module Daggerheart
    class ItemSerializer < ApplicationSerializer
      attributes :id, :name, :kind, :description, :bonuses, :info, :public, :own

      def bonuses
        return [] unless context
        return [] unless context[:bonuses]

        context[:bonuses].select { |item| item.bonusable_id == object.id }.map do |item|
          {
            id: item.id,
            value: item.value,
            dynamic_value: item.dynamic_value
          }
        end
      end

      def own # rubocop: disable Naming/PredicateMethod
        return false unless context
        return false unless context[:current_user_id]

        object.user_id == context[:current_user_id]
      end
    end
  end
end
