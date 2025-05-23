# frozen_string_literal: true

module Pathfinder2
  class CharacterSerializer < ApplicationSerializer
    attributes :provider, :id, :name, :level, :race, :subrace, :main_class, :classes, :languages, :health, :abilities,
               :modifiers, :skills

    delegate :id, :name, :level, :race, :subrace, :main_class, :classes, :languages, :health, :abilities,
             :modifiers, :skills, to: :decorator

    def provider
      'pathfinder2'
    end

    def decorator
      @decorator ||= object.decorator
    end
  end
end
