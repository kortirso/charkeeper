# frozen_string_literal: true

module Daggerheart
  class Item
    class ToolSerializer < ApplicationSerializer
      attributes :id, :name, :description, :items

      def description
        object.description[I18n.locale.to_s]
      end

      def items
        object.recipes.map do |recipe|
          {
            id: recipe.item_id,
            name: recipe.item.name,
            description: recipe.item.description[I18n.locale.to_s]
          }
        end
      end
    end
  end
end
