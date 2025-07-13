# frozen_string_literal: true

module Daggerheart
  module Characters
    class CompanionSerializer < ApplicationSerializer
      attributes :id, :name, :data, :evasion, :stress_max

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
