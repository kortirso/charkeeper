# frozen_string_literal: true

module Daggerheart
  module Homebrew
    class BookSerializer < ApplicationSerializer
      attributes :id, :name, :provider, :items, :shared, :enabled

      def items
        object_items = object.items.group_by(&:itemable_type).transform_values { |item| item.pluck(:itemable_id) }
        {
          races: object_items['Daggerheart::Homebrew::Race'] || [],
          communities: object_items['Daggerheart::Homebrew::Community'] || [],
          subclasses: object_items['Daggerheart::Homebrew::Subclass'] || [],
          items: object_items['Daggerheart::Item'] || []
        }
      end

      def enabled # rubocop: disable Naming/PredicateMethod
        context && context[:enabled_books] ? context[:enabled_books].include?(object.id) : false
      end
    end
  end
end
