# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class ItemSerializer < ApplicationSerializer
      attributes :id, :info, :kind, :recipes

      def recipes
        object.recipes.map { |recipe| translate(recipe.item.name) }
      end
    end
  end
end
