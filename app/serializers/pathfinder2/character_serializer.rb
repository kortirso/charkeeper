# frozen_string_literal: true

module Pathfinder2
  class CharacterSerializer < ApplicationSerializer
    attributes :provider, :id, :name, :level, :race, :subrace, :main_class, :classes, :languages, :health, :abilities,
               :skills, :created_at, :subclasses, :background, :saving_throws_value, :saving_throws

    delegate :id, :name, :level, :race, :subrace, :main_class, :classes, :languages, :health, :abilities,
             :skills, :subclasses, :background, :saving_throws_value, :saving_throws, to: :decorator
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
