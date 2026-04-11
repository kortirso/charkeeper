# frozen_string_literal: true

module Pathfinder2
  class ArchetypesDecorator
    def call(result:)
      result['archetypes'].each do |name, features_count|
        archetype_decorator(result, name, features_count)
      end
    end

    def archetype_decorator(result, name, features_count)
      "Pathfinder2::Archetypes::#{name.camelize}Decorator".constantize
        .new
        .call(result: result, features_count: features_count)
    rescue NameError => _e
    end
  end
end
