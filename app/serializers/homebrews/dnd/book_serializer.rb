# frozen_string_literal: true

module Homebrews
  module Dnd
    class BookSerializer < ApplicationSerializer
      attributes :id, :name, :provider, :items, :shared, :public, :enabled, :own

      def items
        object_items = object.items.group_by(&:itemable_type).transform_values { |item| item.pluck(:itemable_id) }

        {
          items: ::Dnd5::Item.where(id: object_items['Dnd5::Item']).pluck(:name).map { |item| translate(item) },
          classes: subclasses_info(object_items),
          spells: spells(object_items).pluck(:title).map { |item| translate(item) }
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

      def subclasses_info(object_items)
        ::Dnd2024::Homebrew::Subclass
          .where(id: object_items['Dnd2024::Homebrew::Subclass'].to_a + object_items['Homebrew::Subclass'].to_a)
          .hashable_pluck(:name, :class_name)
          .group_by { |i| i[:class_name] }
          .transform_keys { |key| Dnd2024::Character.class_info(key).dig('name', I18n.locale.to_s) }
          .transform_values { |value| value.map { |item| item[:name] } }
      end

      def spells(object_items)
        ::Dnd2024::Feat
          .where(origin: 6)
          .where(id: object_items['Dnd2024::Feat'].to_a + object_items['Feat'].to_a)
      end
    end
  end
end
