# frozen_string_literal: true

module HomebrewsV2
  module Cosmere
    class CultureSerializer < ApplicationSerializer
      attributes :id, :only

      def only
        Charkeeper::Container.resolve('cache.cosmere_names')
          .fetch_list[:settings].slice(*object.info.only)
          .values.map { |item| translate(item[:name]) }
      end
    end
  end
end
