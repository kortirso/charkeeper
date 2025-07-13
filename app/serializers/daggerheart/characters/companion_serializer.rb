# frozen_string_literal: true

module Daggerheart
  module Characters
    class CompanionSerializer < ApplicationSerializer
      attributes :id, :name, :caption, :evasion, :stress_marked, :stress_max, :character_id, :damage, :distance, :experience,
                 :leveling

      delegate :stress_marked, :damage, :distance, :experience, :leveling, to: :data
      delegate :data, to: :object

      def evasion
        data.evasion + (data.leveling['aware'].to_i * 2)
      end

      def stress_max
        data.stress_max + data.leveling['resilient'].to_i
      end
    end
  end
end
