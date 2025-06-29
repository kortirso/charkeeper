# frozen_string_literal: true

module Adminbook
  module Dnd5
    class ItemsController < Adminbook::ItemsController
      private

      def item_type
        'Dnd5::Item'
      end

      def provider
        'dnd5'
      end
    end
  end
end
