# frozen_string_literal: true

module Cosmere
  class CharacterSerializer < ApplicationSerializer
    include Deps[cache: 'cache.avatars']

    attributes :provider, :id, :name, :created_at, :avatar, :skills, :defense, :health_max, :focus_max, :investiture_max, :load,
               :movement, :recovery_die, :senses_range, :level

    delegate :skills, :defense, :health_max, :focus_max, :investiture_max, :load, :movement, :recovery_die, :senses_range,
             to: :decorator
    delegate :data, to: :object
    delegate :attribute_points, :skill_points, :health, :focus, :investiture, :level, to: :data

    def provider
      'cosmere'
    end

    def avatar
      cache.fetch_item(id: object.id)
    end

    def decorator
      @decorator ||= {}
      @decorator.fetch(object.id) do |key|
        @decorator[key] = object.decorator(
          simple: (context ? (context[:simple] || false) : false),
          version: (context ? (context[:version] || nil) : nil)
        )
      end
    end
  end
end
