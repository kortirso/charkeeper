# frozen_string_literal: true

module Daggerheart
  module Homebrew
    class BookSerializer < ApplicationSerializer
      attributes :id, :name, :provider, :items, :shared, :public, :enabled, :own

      def items # rubocop: disable Metrics/AbcSize
        object_items = object.items.group_by(&:itemable_type).transform_values { |item| item.pluck(:itemable_id) }
        {
          races: Daggerheart::Homebrew::Race.where(id: object_items['Daggerheart::Homebrew::Race']).pluck(:name),
          communities: Daggerheart::Homebrew::Community.where(id: object_items['Daggerheart::Homebrew::Community']).pluck(:name),
          subclasses: Daggerheart::Homebrew::Subclass.where(id: object_items['Daggerheart::Homebrew::Subclass']).pluck(:name),
          items: Daggerheart::Item.where(id: object_items['Daggerheart::Item']).pluck(:name).pluck(I18n.locale.to_s),
          transformations: Daggerheart::Homebrew::Transformation.where(id: object_items['Daggerheart::Homebrew::Transformation']).pluck(:name),
          domains: Daggerheart::Homebrew::Domain.where(id: object_items['Daggerheart::Homebrew::Domain']).pluck(:name)
        }
      end

      def enabled # rubocop: disable Naming/PredicateMethod
        context && context[:enabled_books] ? context[:enabled_books].include?(object.id) : false
      end

      def own
        return [] unless context
        return [] unless context[:current_user_id]

        object.user_id == context[:current_user_id]
      end
    end
  end
end
