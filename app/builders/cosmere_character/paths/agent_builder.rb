# frozen_string_literal: true

module CosmereCharacter
  module Paths
    class AgentBuilder
      def call(result:)
        result[:selected_skills] = { 'insight' => 1 }
        result[:initial_talent] = 'opportunist'
        result
      end
    end
  end
end
