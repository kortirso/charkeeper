# frozen_string_literal: true

module HomebrewsV2
  module Cosmere
    class FeatSerializer < ApplicationSerializer
      attributes :id, :title, :description, :modifiers, :info

      def title
        translate(object.title)
      end

      def description
        Charkeeper::Container.resolve('markdown').call(value: translate(object.description), version: '0.4.4')
      end
    end
  end
end
