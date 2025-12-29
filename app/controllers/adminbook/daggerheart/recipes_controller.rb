# frozen_string_literal: true

module Adminbook
  module Daggerheart
    class RecipesController < Adminbook::BaseController
      before_action :find_tools, only: %i[index]

      def index; end

      def new
        @item_recipe = Item::Recipe.new
      end

      def create
        Item::Recipe.create(
          tool: Item.daggerheart.find(create_params[:tool_id]),
          item: Item.daggerheart.find(create_params[:item_id])
        )
        redirect_to adminbook_daggerheart_recipes_path
      end

      private

      def find_tools
        @tools = Item.daggerheart.where(kind: 'recipe').includes(recipes: :item)
      end

      def create_params
        params.require(:item_recipe).permit!.to_h
      end
    end
  end
end
