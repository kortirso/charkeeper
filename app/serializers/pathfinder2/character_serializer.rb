# frozen_string_literal: true

module Pathfinder2
  class CharacterSerializer < ApplicationSerializer
    attributes :id, :name, :object_data, :decorated_data, :provider

    def object_data
      object.data.slice('level', 'race', 'subrace', 'classes')
    end

    def decorated_data
      object.decorate
    end

    def provider
      'pathfinder2'
    end
  end
end
