# frozen_string_literal: true

module Adminbook
  class ItemsController < Adminbook::BaseController
    def index
      @items = Item.where(type: item_type).order(kind: :asc, created_at: :desc)
    end
  end
end
