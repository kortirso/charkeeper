# frozen_string_literal: true

module Daggerheart
  module Homebrew
    class BookSerializer < ApplicationSerializer
      attributes :name, :provider, :items

      def items
        object_items = object.items.group_by(&:itemable_type).transform_values { |item| item.pluck(:itemable_id) }
        {
          races: object_items['Daggerheart::Homebrew::Race'] || [],
          communities: object_items['Daggerheart::Homebrew::Community'] || [],
          subclasses: object_items['Daggerheart::Homebrew::Subclass'] || []
        }
      end
    end
  end
end
