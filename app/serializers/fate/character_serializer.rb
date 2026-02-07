# frozen_string_literal: true

module Fate
  class CharacterSerializer < ApplicationSerializer
    include Deps[cache: 'cache.avatars']

    attributes :provider, :id, :name, :created_at, :avatar

    def provider
      'fate'
    end

    def avatar
      cache.fetch_item(id: object.id)
    end
  end
end
