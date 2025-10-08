# frozen_string_literal: true

module Dc20
  class CharacterSerializer < ApplicationSerializer
    attributes :provider, :id, :name, :level, :main_class, :abilities, :modified_abilities, :created_at, :avatar, :health

    delegate :id, :name, :level, :main_class, :abilities, :modified_abilities, :health, to: :decorator
    delegate :created_at, to: :object

    def provider
      'dc20'
    end

    def avatar
      object.avatar.blob.url if object.avatar.attached?
    end

    def decorator
      @decorator ||= {}
      @decorator.fetch(object.id) do |key|
        @decorator[key] = object.decorator
      end
    end
  end
end
