# frozen_string_literal: true

module CosmereCharacter
  module Paths
    class WarriorBuilder
      def call(result:)
        result[:selected_skills] = { 'athletics' => 1 }
        result[:initial_talent] = 'vigilant_stance'
        result
      end
    end
  end
end
