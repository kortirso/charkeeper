# frozen_string_literal: true

module Pathfinder2
  class ArchetypesDecorator
    def call(result:)
      result['archetypes'].keys.each do |key|
        archetype_decorator(result, key)
      end
    end

    def archetype_decorator(result, key)
      "Pathfinder2::Archetypes::#{key.camelize}Decorator".constantize.new.call(result: result)
    rescue NameError => _e
    end
  end
end
