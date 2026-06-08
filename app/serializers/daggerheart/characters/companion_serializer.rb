# frozen_string_literal: true

module Daggerheart
  module Characters
    class CompanionSerializer < ApplicationSerializer
      include Deps[cache: 'cache.avatars']

      attributes :id, :name, :caption, :stress_marked, :character_id, :damage, :distance, :experience, :leveling, :avatar,
                 :provider, :damage_bonus, :stress_max, :evasion

      delegate :stress_max, :evasion, :damage_bonus, to: :decorator
      delegate :stress_marked, :damage, :distance, :experience, :leveling, to: :data
      delegate :data, to: :object

      def provider = 'daggerheart_companion'

      def avatar
        cache.fetch_item(id: object.id)
      end

      def decorator
        @decorator ||= object.decorator
      end
    end
  end
end
