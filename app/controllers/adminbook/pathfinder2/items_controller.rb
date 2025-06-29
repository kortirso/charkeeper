# frozen_string_literal: true

module Adminbook
  module Pathfinder2
    class ItemsController < Adminbook::ItemsController
      private

      def item_type
        'Pathfinder2::Item'
      end

      def provider
        'pathfinder2'
      end
    end
  end
end
