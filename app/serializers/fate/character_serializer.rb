# frozen_string_literal: true

module Fate
  class CharacterSerializer < ApplicationSerializer
    include Deps[cache: 'cache.avatars']

    attributes :provider, :id, :name, :created_at, :avatar, :aspects, :phase_trio

    delegate :data, to: :object
    delegate :aspects, :phase_trio, to: :data

    def provider
      'fate'
    end

    def avatar
      cache.fetch_item(id: object.id)
    end
  end
end
