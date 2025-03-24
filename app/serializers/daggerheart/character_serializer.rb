# frozen_string_literal: true

module Daggerheart
  class CharacterSerializer < ApplicationSerializer
    attributes :id, :name, :object_data, :decorated_data, :provider

    def object_data
      object.data.slice('level', 'heritage', 'classes')
    end

    def decorated_data
      object.decorate
    end

    def provider
      'daggerheart'
    end
  end
end
