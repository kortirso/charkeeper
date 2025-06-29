# frozen_string_literal: true

module Adminbook
  module Daggerheart
    class ItemsController < Adminbook::ItemsController
      private

      def item_type
        'Daggerheart::Item'
      end

      def provider
        'daggerheart'
      end
    end
  end
end
