# frozen_string_literal: true

module Fate
  class CharacterSerializer < ApplicationSerializer
    include Deps[cache: 'cache.avatars']

    attributes :provider, :id, :name, :created_at, :avatar, :aspects, :phase_trio, :skills_system, :custom_skills,
               :selected_skills, :stress_system, :custom_stress, :selected_stress, :max_stress, :consequences, :stunts,
               :fate_points, :refresh_points

    delegate :max_stress, :refresh_points, to: :decorator
    delegate :data, to: :object
    delegate :aspects, :phase_trio, :skills_system, :custom_skills, :selected_skills, :stress_system, :custom_stress,
             :selected_stress, :consequences, :stunts, :fate_points, to: :data

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
