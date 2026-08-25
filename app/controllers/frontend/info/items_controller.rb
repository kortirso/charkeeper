# frozen_string_literal: true

module Frontend
  module Info
    class ItemsController < Frontend::BaseController
      include Deps[markdown: 'markdown']

      before_action :find_item

      def show
        render json: {
          value: markdown.call(value: @item.description[I18n.locale.to_s], version: params[:version])
        }, status: :ok
      end

      private

      def find_item
        @item = Item.find(params.expect(:id))
      end
    end
  end
end
