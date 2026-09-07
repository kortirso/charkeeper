# frozen_string_literal: true

module HomebrewsV2
  module Cosmere
    class ItemSerializer < ApplicationSerializer
      attributes :id, :info, :kind, :modifiers, :only

      def only
        Charkeeper::Container.resolve('cache.cosmere_names')
          .fetch_list[:settings].slice(*object.info['only'])
          .values.map { |item| translate(item[:name]) }
      end

      def info
        object.info.except('features', 'only')
      end

      def modifiers
        object.modifiers.transform_values { |value| value['value'] }
      end
    end
  end
end
