# frozen_string_literal: true

module Homebrews
  module Daggerheart
    class BookSerializer < ApplicationSerializer
      attributes :id, :title, :provider, :items, :shared, :public, :enabled, :own

      def title
        object.name
      end

      def items
        items = object.items.group_by(&:itemable_type).transform_values { |item| item.pluck(:itemable_id) }

        {
          races: titles(items, ::Daggerheart::Homebrews::Ancestry, 'Homebrew'),
          communities: titles(items, ::Daggerheart::Homebrews::Community, 'Homebrew'),
          transformations: titles(items, ::Daggerheart::Homebrews::Transformation, 'Homebrew'),
          domains: titles(items, ::Daggerheart::Homebrews::Domain, 'Homebrew'),
          classes: subclasses_info(items),
          items: ::Daggerheart::Item.where(id: items['Item']).pluck(:id, :name).to_h.transform_values { |item| translate(item) }
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

      def titles(object_items, model, key)
        model.where(id: object_items[key]).pluck(:id, :title).to_h.transform_values { |item| translate(item) }
      end

      def subclasses_info(items) # rubocop: disable Metrics/AbcSize
        subclasses =
          ::Daggerheart::Homebrews::Subclass
            .where(id: items['Homebrew'])
            .hashable_pluck(:id, :title, :info)
            .group_by { |item| item[:info].class_id }
        classes = ::Daggerheart::Homebrews::Speciality.where(id: subclasses.keys).pluck(:id, :title).to_h
        subclasses
          .transform_keys { |key| translate(classes[key]) }
          .transform_values { |value| value.each_with_object({}) { |item, acc| acc[item[:id]] = translate(item[:title]) } }
      end
    end
  end
end
