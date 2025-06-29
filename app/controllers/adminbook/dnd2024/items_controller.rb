# frozen_string_literal: true

module Adminbook
  module Dnd2024
    class ItemsController < Adminbook::ItemsController
      private

      def item_type
        'Dnd2024::Item'
      end

      def provider
        'dnd2024'
      end
    end
  end
end
