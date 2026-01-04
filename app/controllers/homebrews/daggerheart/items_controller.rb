# frozen_string_literal: true

module Homebrews
  module Daggerheart
    class ItemsController < Homebrews::ItemsController
      include Deps[
        add_item: 'commands.homebrew_context.daggerheart.add_item',
        change_item: 'commands.homebrew_context.daggerheart.change_item',
        copy_item: 'commands.homebrew_context.daggerheart.copy_item'
      ]

      private

      def serializer = ::Homebrews::Daggerheart::ItemSerializer
      def item_class = ::Daggerheart::Item
    end
  end
end
