# frozen_string_literal: true

module Pathfinder2
  module Characters
    class AnimalCompanionSerializer < ApplicationSerializer
      include Deps[cache: 'cache.avatars']

      attributes :id, :name, :caption, :avatar, :level, :saving_throws_value, :health_max, :armor_class, :speed, :perception,
                 :skills, :health, :health_temp, :speeds, :abilities

      delegate :saving_throws_value, :health_max, :armor_class, :speed, :skills, :speeds, to: :decorator
      delegate :data, to: :object
      delegate :level, :health, :health_temp, :perception, :abilities, to: :data

      def avatar
        cache.fetch_item(id: object.id)
      end

      def decorator
        @decorator ||= Pathfinder2::AnimalCompanionDecorator.new.call(animal: object)
      end
    end
  end
end
