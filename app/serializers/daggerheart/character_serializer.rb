# frozen_string_literal: true

module Daggerheart
  class CharacterSerializer < ApplicationSerializer
    attributes :provider, :id, :name, :level, :heritage, :main_class, :classes, :traits

    delegate :id, :name, :level, :heritage, :main_class, :classes, :traits, to: :decorator

    def provider
      'daggerheart'
    end

    def decorator
      @decorator ||= {}
      @decorator.fetch(object.id) do |key|
        @decorator[key] = object.decorator
      end
    end
  end
end
