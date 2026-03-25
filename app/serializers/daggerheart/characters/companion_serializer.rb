# frozen_string_literal: true

module Daggerheart
  module Characters
    class CompanionSerializer < ApplicationSerializer
      include Deps[cache: 'cache.avatars']

      attributes :id, :name, :caption, :evasion, :stress_marked, :stress_max, :character_id, :damage, :distance, :experience,
                 :leveling, :avatar

      delegate :stress_marked, :damage, :distance, :experience, :leveling, to: :data
      delegate :data, to: :object

      def evasion
        data.evasion + (data.leveling['aware'].to_i * 2)
      end

      def stress_max
        data.stress_max + data.leveling['resilient'].to_i
      end

      def avatar
        cache.fetch_item(id: object.id)
      end
    end
  end
end
