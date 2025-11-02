# frozen_string_literal: true

module Adminbook
  class ItemsController < Adminbook::BaseController
    def index
      @items = Item.where(type: item_class.to_s).order(kind: :asc, created_at: :desc)
    end

    def new
      @item = item_class.new
    end

    def edit
      @item = item_class.find(params[:id])
    end

    def create
      item = item_class.new(transform_params(item_params))
      redirect_to adminbook_items_path(provider: params[:provider]) if item.save
    end

    def update
      item = item_class.find(params[:id])
      redirect_to adminbook_items_path(provider: params[:provider]) if item.update(transform_params(item_params))
    end

    def destroy
      item = item_class.find(params[:id])
      item.destroy
      redirect_to adminbook_items_path(provider: params[:provider])
    end

    private

    def item_class
      case params[:provider]
      when 'dnd5', 'dnd2024' then ::Dnd5::Item
      when 'daggerheart' then ::Daggerheart::Item
      when 'pathfinder2' then ::Pathfinder2::Item
      when 'dc20' then ::Dc20::Item
      end
    end

    def transform_params(updating_params)
      updating_params['data'] = JSON.parse(updating_params['data'].gsub(' =>', ':').gsub('nil', 'null'))
      updating_params['info'] = JSON.parse(updating_params['info'].gsub(' =>', ':').gsub('nil', 'null'))
      updating_params
    end

    def item_params
      params.expect(item: [:slug, :data, :info, { name: %i[en ru], description: %i[en ru] }])
    end
  end
end
