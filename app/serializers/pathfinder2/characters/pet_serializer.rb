# frozen_string_literal: true

module Pathfinder2
  module Characters
    class PetSerializer < ApplicationSerializer
      include Deps[cache: 'cache.avatars']

      attributes :id, :name, :caption, :avatar, :data

      def avatar
        cache.fetch_item(id: object.id)
      end
    end
  end
end
