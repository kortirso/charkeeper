# frozen_string_literal: true

module Pathfinder2
  class CharacterSerializer < ApplicationSerializer
    attributes :provider, :id, :name, :level, :race, :subrace, :main_class, :classes, :languages, :health, :abilities,
               :modifiers, :skills, :created_at

    delegate :id, :name, :level, :race, :subrace, :main_class, :classes, :languages, :health, :abilities,
             :modifiers, :skills, to: :decorator
    delegate :created_at, to: :object

    def provider
      'pathfinder2'
    end

    def decorator
      @decorator ||= {}
      @decorator.fetch(object.id) do |key|
        @decorator[key] = object.decorator
      end
    end
  end
end
