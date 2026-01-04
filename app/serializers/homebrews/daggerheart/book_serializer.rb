# frozen_string_literal: true

module Homebrews
  module Daggerheart
    class BookSerializer < ApplicationSerializer
      attributes :id, :name, :provider, :items, :shared, :public, :enabled, :own

      def items # rubocop: disable Metrics/AbcSize
        object_items = object.items.group_by(&:itemable_type).transform_values { |item| item.pluck(:itemable_id) }

        {
          races: ::Daggerheart::Homebrew::Race.where(id: object_items['Daggerheart::Homebrew::Race']).pluck(:name),
          communities: ::Daggerheart::Homebrew::Community.where(id: object_items['Daggerheart::Homebrew::Community']).pluck(:name),
          classes: subclasses_info(object_items),
          items: ::Daggerheart::Item.where(id: object_items['Daggerheart::Item']).pluck(:name).pluck(I18n.locale.to_s),
          transformations: ::Daggerheart::Homebrew::Transformation.where(id: object_items['Daggerheart::Homebrew::Transformation']).pluck(:name),
          domains: ::Daggerheart::Homebrew::Domain.where(id: object_items['Daggerheart::Homebrew::Domain']).pluck(:name)
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
        subclasses =
          ::Daggerheart::Homebrew::Subclass
            .where(id: object_items['Daggerheart::Homebrew::Subclass'])
            .hashable_pluck(:name, :class_name)
            .group_by { |i| i[:class_name] }
        classes = ::Daggerheart::Homebrew::Speciality.where(id: subclasses.keys).pluck(:id, :name).to_h
        subclasses.transform_keys { |key| classes[key] }.transform_values { |value| value.map { |item| item[:name] } }
      end
    end
  end
end
