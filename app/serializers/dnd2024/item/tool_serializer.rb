# frozen_string_literal: true

module Dnd2024
  module Item
    class ToolSerializer < ApplicationSerializer
      attributes :id, :name, :items

      def items
        object.recipes.map do |recipe|
          output_per_day = recipe.info['output_per_day'].presence || (1_000.0 / recipe.item.data.price)
          {
            id: recipe.item_id,
            name: recipe.item.name,
            price_per_item: recipe.item.data.price / 2,
            output_per_day: output_per_day
          }
        end
      end
    end
  end
end
