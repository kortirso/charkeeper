# frozen_string_literal: true

module Frontend
  module Info
    class ItemsController < Frontend::BaseController
      before_action :find_item

      def show
        render json: { value: @item.description[I18n.locale.to_s] }, status: :ok
      end

      private

      def find_item
        @item = Item.find(params[:id])
      end
    end
  end
end
