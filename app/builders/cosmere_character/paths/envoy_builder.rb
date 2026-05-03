# frozen_string_literal: true

module CosmereCharacter
  module Paths
    class EnvoyBuilder
      def call(result:)
        result[:selected_skills] = { 'discipline' => 1 }
        result[:initial_talents] = ['rousing_presence']
        result
      end
    end
  end
end
