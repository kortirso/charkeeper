# frozen_string_literal: true

module Daggerheart
  class Item
    class ToolSerializer < ApplicationSerializer
      attributes :id, :name, :items

      def items
        object.recipes.map do |recipe|
          {
            id: recipe.item_id,
            name: recipe.item.name
          }
        end
      end
    end
  end
end
