# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class ItemSerializer < ApplicationSerializer
      attributes :id, :info, :kind, :recipes, :modifiers, :features

      def recipes
        object.recipes.map { |recipe| translate(recipe.item.name) }
      end

      def info
        object.info.except('features')
      end

      def features
        markdown = Charkeeper::Container.resolve('markdown')
        object.info['features']&.map { |feature| markdown.call(value: translate(feature), version: '0.5.9') }
      end

      def modifiers
        object.modifiers.transform_values { |value| value['value'] }
      end
    end
  end
end
