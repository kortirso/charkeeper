# frozen_string_literal: true

module Homebrews
  module Nimble
    class BookSerializer < ApplicationSerializer
      attributes :id, :title, :provider, :items, :shared, :public, :enabled, :own, :upvotes_count, :upvoted

      def title
        object.name
      end

      def items
        items = object.items.group_by(&:itemable_type).transform_values { |item| item.pluck(:itemable_id) }

        {
          races: titles(items, ::Nimble::Homebrews::Ancestry, 'Homebrew'),
          items: transform(::Nimble::Item.kept.where(id: items['Item']).pluck(:id, :name))
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

      def upvoted # rubocop: disable Naming/PredicateMethod
        return false unless context
        return false unless context[:upvotes]

        context[:upvotes].include?(object.id)
      end

      def titles(object_items, model, key)
        model.where(id: object_items[key]).pluck(:id, :title).to_h.transform_values { |item| translate(item) }
      end

      def transform(values)
        values.to_h.transform_values { |item| translate(item) }
      end
    end
  end
end
