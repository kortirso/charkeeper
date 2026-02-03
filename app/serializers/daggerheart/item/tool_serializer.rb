# frozen_string_literal: true

module Daggerheart
  class Item
    class ToolSerializer < ApplicationSerializer
      attributes :id, :name, :description, :items

      def description
        translate(object.description)
      end

      def items
        object.recipes.map do |recipe|
          {
            id: recipe.item_id,
            name: recipe.item.name,
            description: translate(recipe.item.description)
          }
        end
      end
    end
  end
end
