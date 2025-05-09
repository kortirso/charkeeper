# frozen_string_literal: true

module Dnd5
  class CharacterSerializer < ApplicationSerializer
    include Rails.application.routes.url_helpers

    default_url_options[:host] = 'localhost'

    attributes :id, :name, :object_data, :decorated_data, :provider, :avatar

    def object_data
      object.data.slice('level', 'race', 'subrace', 'classes')
    end

    def decorated_data
      object.decorate
    end

    def provider
      'dnd5'
    end

    def avatar
      url_for(object.avatar) if object.avatar.attached?
    end
  end
end
