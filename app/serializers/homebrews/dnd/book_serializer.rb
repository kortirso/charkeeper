# frozen_string_literal: true

module Homebrews
  module Dnd
    class BookSerializer < ApplicationSerializer
      attributes :id, :name, :provider, :items, :shared, :public, :enabled, :own

      def items
        object_items = object.items.group_by(&:itemable_type).transform_values { |item| item.pluck(:itemable_id) }

        {
          items: ::Dnd5::Item.where(id: object_items['Dnd5::Item']).pluck(:name).map { |item| translate(item) }
        }
      end

      def enabled # rubocop: disable Naming/PredicateMethod
        context && context[:enabled_books] ? context[:enabled_books].include?(object.id) : false
      end

      def own # rubocop: disable Naming/PredicateMethod
        return false unless context
        return false unless context[:current_user_id]

        object.user_id == context[:current_user_id]
      end
    end
  end
end
