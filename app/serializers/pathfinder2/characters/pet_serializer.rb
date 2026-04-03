# frozen_string_literal: true

module Pathfinder2
  module Characters
    class PetSerializer < ApplicationSerializer
      include Deps[cache: 'cache.avatars']

      attributes :id, :name, :caption, :avatar, :data, :level, :saving_throws_value, :health_max, :armor_class, :speed,
                 :perception, :skills, :health, :health_temp, :selected_feats

      delegate :level, :saving_throws_value, :health_max, :armor_class, :speed, :perception, :skills, to: :decorator
      delegate :data, to: :object
      delegate :health, :health_temp, :selected_feats, to: :data

      def avatar
        cache.fetch_item(id: object.id)
      end

      def decorator
        @decorator ||= Pathfinder2PetDecorator.new.call(pet: object)
      end
    end
  end
end
