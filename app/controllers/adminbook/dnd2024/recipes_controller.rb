# frozen_string_literal: true

module Adminbook
  module Dnd2024
    class RecipesController < Adminbook::BaseController
      before_action :find_tools, only: %i[index]

      def index; end

      def new
        @item_recipe = Item::Recipe.new
      end

      def create
        Item::Recipe.create(
          tool: Item.dnd.find(create_params[:tool_id]),
          item: Item.dnd.find(create_params[:item_id]),
          info: create_params[:info]
        )
        redirect_to adminbook_dnd2024_recipes_path
      end

      private

      def find_tools
        @tools = Item.dnd.where(kind: 'tools').includes(recipes: :item)
      end

      def create_params
        params.require(:item_recipe).permit!.to_h
      end
    end
  end
end
