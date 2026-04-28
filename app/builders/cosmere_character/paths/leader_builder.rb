# frozen_string_literal: true

module CosmereCharacter
  module Paths
    class LeaderBuilder
      def call(result:)
        result[:selected_skills] = { 'leadership' => 1 }
        result[:initial_talent] = 'decisive_command'
        result
      end
    end
  end
end
