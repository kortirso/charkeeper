# frozen_string_literal: true

module HomebrewsV2
  module Nimble
    class FeatSerializer < ApplicationSerializer
      attributes :id, :title, :description, :limit, :limit_refresh, :conditions, :modifiers, :info

      def title
        translate(object.title)
      end

      def description
        Charkeeper::Container.resolve('markdown').call(value: translate(object.description), version: '0.4.4')
      end

      def limit
        object.info['limit']
      end
    end
  end
end
