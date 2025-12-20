# frozen_string_literal: true

module Homebrews
  module Dnd
    class ItemsController < Homebrews::ItemsController
      include Deps[
        add_item: 'commands.homebrew_context.dnd.add_item',
        change_item: 'commands.homebrew_context.dnd.change_item'
      ]

      private

      def serializer = ::Homebrews::Dnd::ItemSerializer
      def item_class = ::Dnd5::Item
    end
  end
end
