# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class FeatSerializer < ApplicationSerializer
      attributes :id, :title, :description, :limit, :limit_refresh, :conditions, :items, :modifiers

      def title
        translate(object.title)
      end

      def description
        Charkeeper::Container.resolve('markdown').call(value: translate(object.description), version: '0.4.4')
      end

      def limit
        object.description_eval_variables['limit']
      end

      def items
        object.items.hashable_pluck(:info, :kind)
      end
    end
  end
end
