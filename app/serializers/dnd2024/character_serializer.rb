# frozen_string_literal: true

module Dnd2024
  class CharacterSerializer < ApplicationSerializer
    attributes :id, :name, :object_data, :decorated_data, :provider

    def object_data
      object.data.slice('level', 'species', 'classes')
    end

    def decorated_data
      object.decorate
    end

    def provider
      'dnd2024'
    end
  end
end
