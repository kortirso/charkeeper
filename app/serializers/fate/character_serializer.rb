# frozen_string_literal: true

module Fate
  class CharacterSerializer < ApplicationSerializer
    include Deps[cache: 'cache.avatars']

    attributes :provider, :id, :name, :created_at, :avatar, :aspects, :phase_trio, :skills_system, :custom_skills,
               :selected_skills, :stress_system, :custom_stress, :selected_stress, :max_stress, :consequences

    delegate :max_stress, to: :decorator
    delegate :data, to: :object
    delegate :aspects, :phase_trio, :skills_system, :custom_skills, :selected_skills, :stress_system, :custom_stress,
             :selected_stress, :consequences, to: :data

    def provider
      'fate'
    end

    def avatar
      cache.fetch_item(id: object.id)
    end

    def decorator
      @decorator ||= {}
      @decorator.fetch(object.id) do |key|
        @decorator[key] = object.decorator
      end
    end
  end
end
